class ChatView(APIView):

    def get(self, request):
        """
        用户点击进入对话页面时，返回当前可用的角色和相关的对话。
        """
        user = request.user
        # 获取所有已激活的角色
        roles_list = self.get_active_ai_roles(user)
        # 获取用户的历史对话
        content = self.get_open_dialogs(user)
        return Response({
            "status": True,
            "message": "",
            "data": {
                "content": content,  # 当前未关闭的对话列表
                "model_list": roles_list,  # 可用角色列表
            }
        })

    def post(self, request):
        """
        用户提交对话，调用AI接口并返回结果。只保存最多10轮对话。
        """
        content = request.data.get('content')  # 用户输入的文本
        dialog_id = request.data.get('dialog_id')  # 当前对话ID
        role_name = request.data.get('model_name')  # 选择的角色名称

        # 判断是否有余额
        if request.user.balance <= 0:
            return Response({"status": False, "message": "你的余额不足，请充值"})

        # 获取角色信息
        try:
            ai_role_instance = models.AIRole.objects.get(nickname=role_name, is_active=True)
            model_name = ai_role_instance.ai_model.model_name
            context_limit = ai_role_instance.context_limit
            prompt = ai_role_instance.prompt
        except models.AIRole.DoesNotExist:
            return Response({"status": False, "message": "角色未找到或已下架"})

        if not content or not dialog_id:
            return Response({"status": False, "message": "请输入内容和对话ID"})

        # 查找对话并更新
        dialog = models.Dialog.objects.get(dialog_id=dialog_id)
        dialog.last_active_at = timezone.now()
        dialog.save()

        # 获取对话详情并限制最多10轮对话
        messages = self.get_post_dialog_details(dialog_id, context_limit)

        # 添加角色的prompt和用户的输入内容
        if prompt:
            messages.insert(0, {"role": "system", "content": prompt})
        messages.append({"role": "user", "content": content})

        # 调用AI接口获取AI的回复
        ai_message = self.ai_to_text(messages, model_name)

        # 记录用户对话
        models.DialogDetail.objects.create(
            dialog=dialog,
            message_type='user',
            text_content=content,
            ai_role=ai_role_instance
        )

        # 记录AI的回复
        models.DialogDetail.objects.create(
            dialog=dialog,
            message_type='assistant',
            text_content=ai_message,
            ai_role=ai_role_instance
        )

        # 扣除用户余额
        request.user.balance -= 1  # 假设每次对话扣除1个余额单位
        request.user.save()

        return Response({
            "status": True,
            "message": "对话成功",
            "data": {
                "dialog_id": dialog_id,
                "dialog_name": dialog.dialog_name,
                "content": ai_message,
            }
        })

    def get_post_dialog_details(self, dialog_id, context_limit):
        """
        获取对话的详细内容并限制返回的对话轮数（最多context_limit轮）
        """
        dialog = models.Dialog.objects.get(dialog_id=dialog_id)
        dialog_details = models.DialogDetail.objects.filter(dialog=dialog).order_by('-timestamp')[:context_limit]
        dialog_details = reversed(dialog_details)
        content = [{"role": detail.message_type, "content": detail.text_content} for detail in dialog_details]
        return content

    def ai_to_text(self, messages, model_name):
        """
        调用API获取AI的回复
        """
        response = client.chat.completions.create(
            model=model_name,
            messages=messages
        )
        ai_message = response.choices[0].message.content
        return ai_message
