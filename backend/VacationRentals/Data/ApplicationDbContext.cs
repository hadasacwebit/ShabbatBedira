using Microsoft.EntityFrameworkCore;
using VacationRentals.Models;

namespace VacationRentals.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Apartment> Apartments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.GoogleId).IsUnique();
        });

        modelBuilder.Entity<Apartment>(entity =>
        {
            entity.HasIndex(e => e.City);
            entity.HasIndex(e => e.PricePerNight);
            entity.HasIndex(e => e.NumberOfBeds);
            entity.HasIndex(e => e.NumberOfRooms);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsPaid);
        });
    }
}
