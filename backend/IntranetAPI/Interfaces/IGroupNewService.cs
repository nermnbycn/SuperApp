using System;
using IntranetAPI.Entities;

namespace IntranetAPI.Interfaces;

public interface IGroupNewService
{
    Task<List<GroupNew>> GetAllNews();
    Task<GroupNew?> GetGroupNewByIdAsync(int id);

}
