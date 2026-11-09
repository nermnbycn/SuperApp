using System;
using IntranetAPI.Dto_s;

namespace IntranetAPI.Interfaces;

public interface IProfileService
{
    Task<ProfileDTO> GetMyProfileAsync();

}
