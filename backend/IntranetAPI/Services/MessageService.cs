
using Microsoft.EntityFrameworkCore;
using IntranetAPI.Entities;
using IntranetAPI.Interfaces;
using IntranetAPI.Data;

namespace IntranetAPI.Services;

public class MessageService : IMessageService
{
    private readonly AppDbContext _context;

    public MessageService(AppDbContext appDbContext)
    {
        _context = appDbContext;
    }

    // KULLANICIYA GELEN MESAJLAR
    public async Task<List<CelebrationMessage>> GetMessagesAsync(
        string userId)
    {
        return await _context.Set<CelebrationMessage>()
            .AsNoTracking()
            .Where(x => x.ReceiverId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // OKUNMAMIŞ MESAJ SAYISI
    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Set<CelebrationMessage>()
            .CountAsync(x =>
                x.ReceiverId == userId && !x.IsRead);
    }

    // KUTLAMA MESAJI GÖNDER
    public async Task<CelebrationMessage> SendMessageAsync(
        string senderId,
        string receiverId,
        string message,
        string type)
    {
        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException(
                "Mesaj boş olamaz.");

        if (senderId == receiverId)
            throw new ArgumentException(
                "Kendinize mesaj gönderemezsiniz.");

        if (type != "birthday" && type != "anniversary")
            throw new ArgumentException(
                "Geçersiz kutlama türü.");

        var receiverExists = await _context
            .Set<ApplicationUser>()
            .AnyAsync(x => x.Id == receiverId);

        if (!receiverExists)
            throw new KeyNotFoundException(
                "Alıcı kullanıcı bulunamadı.");

        var newMessage = new CelebrationMessage
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ReceiverId = receiverId,
            Message = message.Trim(),
            Type = type,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
            ReactionEmoji = null
        };
        var currentYear = DateTime.UtcNow.Year;

        var alreadySent = await _context.CelebrationMessages
            .AnyAsync(m =>
                m.SenderId == senderId &&
                m.ReceiverId == receiverId &&
                m.Type == type &&
                m.CreatedAt.Year == currentYear
            );

        if (alreadySent)
        {
            throw new InvalidOperationException(
                "Bu kullanıcıyı bu yıl zaten kutladınız."
            );
        }

        _context.Set<CelebrationMessage>()
            .Add(newMessage);

        await _context.SaveChangesAsync();

        return newMessage;
    }
    public async Task<bool> HasCelebratedAsync(
    string senderId,
    string receiverId,
    string type)
    {
        var start = new DateTime(
            DateTime.UtcNow.Year, 1, 1);

        var end = start.AddYears(1);

        return await _context.CelebrationMessages
            .AsNoTracking()
            .AnyAsync(m =>
                m.SenderId == senderId &&
                m.ReceiverId == receiverId &&
                m.Type == type &&
                m.CreatedAt >= start &&
                m.CreatedAt < end
            );
    }

    // MESAJI OKUNDU İŞARETLE
    public async Task<bool> MarkAsReadAsync(
        Guid messageId,
        string userId)
    {
        var message = await _context
            .Set<CelebrationMessage>()
            .FirstOrDefaultAsync(x =>
                x.Id == messageId &&
                x.ReceiverId == userId);

        if (message == null)
            return false;

        if (!message.IsRead)
        {
            message.IsRead = true;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    // EMOJİ İLE YANIT VER
    public async Task<bool> ReactToMessageAsync(
        Guid messageId,
        string userId,
        string emoji)
    {
        string[] allowedEmojis =
        {
            "❤️", "🥳", "🎉", "🙏", "😊", "👏"
        };

        if (!allowedEmojis.Contains(emoji))
            throw new ArgumentException(
                "Geçersiz emoji.");

        var message = await _context
            .Set<CelebrationMessage>()
            .FirstOrDefaultAsync(x =>
                x.Id == messageId &&
                x.ReceiverId == userId);

        if (message == null)
            return false;

        message.ReactionEmoji = emoji;
        message.IsRead = true;

        await _context.SaveChangesAsync();

        return true;

    }
}
