
using IntranetAPI;
using IntranetAPI.Entities;

namespace IntranetAPI.Interfaces;

public interface IMessageService
{
    // Kullanıcıya gelen mesajlar
    Task<List<CelebrationMessage>> GetMessagesAsync(
        string userId);

    // Okunmamış mesaj sayısı
    Task<int> GetUnreadCountAsync(
        string userId);

    // Kutlama mesajı gönder
    Task<CelebrationMessage> SendMessageAsync(
        string senderId,
        string receiverId,
        string message,
        string type);

    // Mesajı okundu olarak işaretle
    Task<bool> MarkAsReadAsync(
        Guid messageId,
        string userId);
    Task<bool> HasCelebratedAsync(
string senderId,
string receiverId,
string type
);

    // Emoji ile yanıt ver
    Task<bool> ReactToMessageAsync(
        Guid messageId,
        string userId,
        string emoji);
}
