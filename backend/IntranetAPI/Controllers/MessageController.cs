
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

using IntranetAPI.Data;
using IntranetAPI.Interfaces;
using IntranetAPI.DTOs;

namespace IntranetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly IMessageService _messageService;
    private readonly AppDbContext _context;

    public MessageController(
        IMessageService messageService,
        AppDbContext context)
    {
        _messageService = messageService;
        _context = context;
    }

    // GELEN MESAJLARI GETİR
    // GET: api/Message?userId=xxx
    [HttpGet]
    public async Task<IActionResult> GetMessages(
        [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return BadRequest("Kullanıcı ID gerekli.");

        var messages =
            await _messageService.GetMessagesAsync(userId);

        var senderIds = messages
            .Select(x => x.SenderId)
            .Distinct()
            .ToList();

        var senders = await _context.Users
            .AsNoTracking()
            .Where(x => senderIds.Contains(x.Id))
            .Select(x => new
            {
                x.Id,
                x.NameSurname,
                x.ImageUrl
            })
            .ToListAsync();

        var result = messages.Select(message =>
        {
            var sender = senders.FirstOrDefault(
                x => x.Id == message.SenderId);

            return new
            {
                message.Id,
                message.SenderId,
                message.ReceiverId,

                SenderName = sender == null
                    ? "Bilinmeyen Kullanıcı"
                    : sender.NameSurname,

                SenderImageUrl = sender?.ImageUrl,

                message.Message,
                message.Type,
                message.CreatedAt,
                message.IsRead,
                message.ReactionEmoji
            };
        });

        return Ok(result);
    }

    // OKUNMAMIŞ MESAJ SAYISI
    // GET: api/Message/unread-count?userId=xxx
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(
        [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return BadRequest("Kullanıcı ID gerekli.");

        var count =
            await _messageService.GetUnreadCountAsync(userId);

        return Ok(new
        {
            unreadCount = count
        });
    }

    // BU YIL KUTLAMA YAPILDI MI?
    // GET: api/Message/celebrated?receiverId=xxx&type=birthday
    [Authorize]
    [HttpGet("celebrated")]
    public async Task<IActionResult> HasCelebrated(
        [FromQuery] string receiverId,
        [FromQuery] string type)
    {
        var senderId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(senderId))
            return Unauthorized("Oturum bilgisi bulunamadı.");

        if (string.IsNullOrWhiteSpace(receiverId))
            return BadRequest("Alıcı ID gerekli.");

        if (type != "birthday" && type != "anniversary")
            return BadRequest("Geçersiz kutlama türü.");

        var hasCelebrated =
            await _messageService.HasCelebratedAsync(
                senderId,
                receiverId,
                type
            );

        return Ok(new
        {
            hasCelebrated
        });
    }

    // KUTLAMA MESAJI GÖNDER
    // POST: api/Message
    [HttpPost]
    public async Task<IActionResult> SendMessage(
        [FromBody] SendMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SenderId) ||
            string.IsNullOrWhiteSpace(request.ReceiverId))
        {
            return BadRequest(
                "Gönderen ve alıcı ID gerekli.");
        }

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Mesaj boş olamaz.");

        if (request.Type != "birthday" &&
            request.Type != "anniversary")
        {
            return BadRequest("Geçersiz kutlama türü.");
        }

        try
        {
            var message =
                await _messageService.SendMessageAsync(
                    request.SenderId,
                    request.ReceiverId,
                    request.Message,
                    request.Type
                );

            return Ok(new
            {
                message.Id,
                message.SenderId,
                message.ReceiverId,
                message.Message,
                message.Type,
                message.CreatedAt,
                message.IsRead,
                message.ReactionEmoji
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
        catch (DbUpdateException ex)
            when (
                ex.InnerException is SqlException sqlEx &&
                (sqlEx.Number == 2601 || sqlEx.Number == 2627)
            )
        {
            return Conflict(new
            {
                message = "Bu kişiyi bu yıl zaten kutladınız."
            });
        }
    }

    // MESAJI OKUNDU İŞARETLE
    // PATCH: api/Message/{messageId}/read
    [HttpPatch("{messageId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(
        Guid messageId,
        [FromBody] MessageUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("Kullanıcı ID gerekli.");

        var success =
            await _messageService.MarkAsReadAsync(
                messageId,
                request.UserId
            );

        if (!success)
            return NotFound("Mesaj bulunamadı.");

        return Ok(new
        {
            messageId,
            isRead = true
        });
    }

    // MESAJI EMOJİYLE YANITLA
    // PATCH: api/Message/{messageId}/reaction
    [HttpPatch("{messageId:guid}/reaction")]
    public async Task<IActionResult> ReactToMessage(
        Guid messageId,
        [FromBody] MessageReactionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("Kullanıcı ID gerekli.");

        try
        {
            var success =
                await _messageService.ReactToMessageAsync(
                    messageId,
                    request.UserId,
                    request.Emoji
                );

            if (!success)
                return NotFound("Mesaj bulunamadı.");

            return Ok(new
            {
                messageId,
                reactionEmoji = request.Emoji,
                isRead = true
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
