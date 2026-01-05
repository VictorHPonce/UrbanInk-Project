using Microsoft.EntityFrameworkCore;
using UrbanInk.Api.Domain.Entities;
using UrbanInk.Api.Infrastructure.Extensions;

namespace UrbanInk.Api.Infrastructure.Persistence
{
    public class UrbanInkDbContext : DbContext
    {
        public UrbanInkDbContext(DbContextOptions<UrbanInkDbContext> options)
            : base(options) { }

        // TABLAS
        // Usamos Set<T>() que es la sintaxis moderna y más rápida
        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<ShippingRule> ShippingRules => Set<ShippingRule>();
        public DbSet<UserAddress> UserAddresses => Set<UserAddress>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. USUARIOS (Índices y restricciones)
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique(); // Email único
                entity.Property(u => u.Role).HasDefaultValue("USER");
            });

            // 2. RELACIÓN USER -> REFRESH TOKENS (1:N)
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Token).IsRequired();

                entity.HasOne(rt => rt.User)
                      .WithMany(u => u.RefreshTokens)
                      .HasForeignKey(rt => rt.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // Borrar usuario -> Borra tokens
            });

            // 3. RELACIÓN USER -> ADDRESSES (1:N)
            modelBuilder.Entity<UserAddress>(entity =>
            {
                entity.HasOne(a => a.User)
                      .WithMany(u => u.Addresses)
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // Borrar usuario -> Borra direcciones
            });

            // 4. RELACIÓN USER -> ORDERS (1:N) - IMPORTANTE
            modelBuilder.Entity<Order>(entity =>
            {
                // Configuramos decimales para dinero (Postgres 'numeric')
                entity.Property(o => o.SubTotal).HasPrecision(18, 2);
                entity.Property(o => o.ShippingCost).HasPrecision(18, 2);
                entity.Property(o => o.Total).HasPrecision(18, 2);

                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId)
                      .OnDelete(DeleteBehavior.SetNull); // Borrar usuario -> Mantiene historial pedidos (UserId null)
            });

            // 5. RELACIÓN ORDER -> ITEMS (1:N)
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(i => i.UnitPrice).HasPrecision(18, 2);

                // Ignoramos la propiedad calculada 'Total' para que no intente crear columna
                // (O la dejamos si queremos persistirla, EF Core suele ignorar getters sin setter, pero por seguridad:)
                // entity.Ignore(i => i.Total); 

                entity.HasOne(i => i.Order)
                      .WithMany(o => o.Items)
                      .HasForeignKey(i => i.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 6. PRODUCTOS
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Price).HasPrecision(18, 2);
            });

            // 7. REGLAS DE ENVÍO
            modelBuilder.Entity<ShippingRule>(entity =>
            {
                entity.Property(p => p.Cost).HasPrecision(18, 2);
                entity.Property(p => p.FreeThreshold).HasPrecision(18, 2);
            });

            // Convención global: Nombres en snake_case
            modelBuilder.UseSnakeCaseNames();
        }
    }
}