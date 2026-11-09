using System;

namespace IntranetAPI.Entities;

public class FoodMenu
{

    public int Id { get; set; }
    public DateOnly MenuDate { get; set; }

    public string Food1 { get; set; } = string.Empty;
    public int Calorie1 { get; set; }

    public string Food2 { get; set; } = string.Empty;
    public int Calorie2 { get; set; }

    public string Food3 { get; set; } = string.Empty;
    public int Calorie3 { get; set; }

    public string Food4 { get; set; } = string.Empty;
    public int Calorie4 { get; set; }


}
