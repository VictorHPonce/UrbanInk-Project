using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UrbanInk.Api.Domain.Entities;

namespace UrbanInk.Api.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            // 1. Obtenemos el contexto y los servicios necesarios
            var context = serviceProvider.GetRequiredService<UrbanInkDbContext>();
            var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher<User>>();

            // 2. Aseguramos que la BBDD exista y aplica migraciones pendientes automáticamente
            await context.Database.MigrateAsync();

            // 3. SEEDING DE USUARIOS (Si no hay usuarios, creamos el Admin)
            if (!await context.Users.AnyAsync())
            {
                var admin = new User
                {
                    FirstName = "Victor",
                    LastName = "Admin",
                    Email = "admin@urbanink.com",
                    Role = "ADMIN",
                    CreatedAt = DateTime.UtcNow
                };
                // Encriptamos la contraseña "Admin123!"
                admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin123!");

                context.Users.Add(admin);

                var user = new User
                {
                    FirstName = "Cliente",
                    LastName = "Pruebas",
                    Email = "cliente@urbanink.com",
                    Role = "USER",
                    CreatedAt = DateTime.UtcNow
                };
                user.PasswordHash = passwordHasher.HashPassword(user, "User123!");

                context.Users.Add(user);

                await context.SaveChangesAsync();
            }

            // 4. SEEDING DE REGLAS DE ENVÍO
            if (!await context.ShippingRules.AnyAsync())
            {
                context.ShippingRules.AddRange(
                    new ShippingRule { Name = "Envío Estándar", Cost = 5.99m, FreeThreshold = 100.00m, IsActive = true },
                    new ShippingRule { Name = "Envío Express", Cost = 12.50m, FreeThreshold = null, IsActive = true }
                );
                await context.SaveChangesAsync();
            }

            // 5. SEEDING DE PRODUCTOS (Datos Dummy para probar la tienda)
            if (!await context.Products.AnyAsync())
            {
                context.Products.AddRange(
                    new Product
                    {
                        Name = "Camiseta Urban Skull",
                        Description = "Algodón premium con diseño exclusivo.",
                        Price = 25.00m,
                        Stock = 50,
                        Category = "Camisetas",
                        ImageUrl = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800", // Foto real de Unsplash
                        IsActive = true
                    },
                    new Product
                    {
                        Name = "Sudadera Dark Soul",
                        Description = "Perfecta para el invierno urbano.",
                        Price = 45.00m,
                        Stock = 20,
                        Category = "Sudaderas",
                        ImageUrl = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
                        IsActive = true,
                        IsFeatured = true
                    },
                    new Product
                    {
                        Name = "Gorra Snapback",
                        Description = "Estilo clásico ajustable.",
                        Price = 15.00m,
                        Stock = 100,
                        Category = "Gorras",
                        ImageUrl = "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800",
                        IsActive = true
                    }
                );
                await context.SaveChangesAsync();
            }
        }
    }
}