
using System.ComponentModel.DataAnnotations;

namespace IntranetAPI.DTOs
{


    public class SendMessageRequest
    {
        public string SenderId { get; set; } = string.Empty;

        public string ReceiverId { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;
    }

    public class MessageUserRequest
    {
        public string UserId { get; set; } = string.Empty;
    }

    public class MessageReactionRequest
    {
        public string UserId { get; set; } = string.Empty;

        public string Emoji { get; set; } = string.Empty;
    }
}