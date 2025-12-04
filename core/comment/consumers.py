from channels.generic.websocket import AsyncJsonWebsocketConsumer

class CommentListConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_name = "comments_list"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # метод, который будет вызываться через group_send
    async def comment_created(self, event):
        await self.send_json({
            "type": "comment_created",
            "comment": event["comment"],
        })


class CommentThreadConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.comment_id = self.scope["url_route"]["kwargs"]["comment_id"]
        self.group_name = f"comment_{self.comment_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def reply_created(self, event):
        await self.send_json({
            "type": "reply_created",
            "comment": event["comment"],
        })
