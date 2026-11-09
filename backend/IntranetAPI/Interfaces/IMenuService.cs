using IntranetAPI.Entities;

namespace IntranetAPI.Interfaces
{
    public interface IMenuService
    {
        Task<List<FoodMenu>> GetRemainingWeekMenusAsync();  //o haftanın günlerini ve yemek menülerini getiren fonksiyon
    }
}
