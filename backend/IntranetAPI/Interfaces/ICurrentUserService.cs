using System;

namespace IntranetAPI.Interfaces;

public interface ICurrentUserService
{
    string GetUserId();
    bool IsAuthenticated();
}
