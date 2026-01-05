using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanInk.Api.Application.Interfaces;
using UrbanInk.Api.Domain.Entities;
using UrbanInk.Api.Infrastructure.Persistence;
using UrbanInk.Api.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// ==================================================================
// 1. CAPA DE SERVICIOS (Configuración e Inyección de Dependencias)
// ==================================================================

// --- A. Base de Datos ---
// Nota: La convención SnakeCase ya la configuramos dentro del DbContext, así que aquí queda limpio.
builder.Services.AddDbContext<UrbanInkDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// --- B. CORS (Política de acceso) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Angular dev server
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// --- C. Autenticación & JWT ---
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
        };

        // Evento para logs o depuración de auth si fuera necesario
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// --- D. Servicios de Identidad (Password Hashing) ---
// Necesario para que el Seeder pueda encriptar contraseñas
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// --- E. Inyección de Dependencias (Nuestros Servicios) ---
builder.Services.AddHttpContextAccessor(); // Necesario para obtener URL base en FileService
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAddressService, AddressService>();

// --- F. Controladores y Swagger ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==================================================================
// 2. CONSTRUCCIÓN DE LA APP
// ==================================================================
var app = builder.Build();

// ==================================================================
// 3. INICIALIZACIÓN DE DATOS (SEEDING)
// ==================================================================
// Esto se ejecuta UNA vez al arrancar. Si no existe la BBDD, la crea.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Llamamos a nuestro Inicializador Maestro
        await DbInitializer.SeedAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ Error grave al inicializar la base de datos.");
    }
}

// ==================================================================
// 4. MIDDLEWARE PIPELINE (El orden importa mucho aquí)
// ==================================================================

// 1. Swagger (Solo en desarrollo para ver la documentación)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. Archivos Estáticos (Imágenes)
// IMPORTANTE: Ponerlo ANTES de Auth para que las imágenes de productos sean públicas.
// Si lo pones después, necesitarías token para ver la foto de una camiseta.
app.UseStaticFiles();

// 3. CORS
// Debe ir antes de Auth para que el navegador pueda preguntar "¿Puedo entrar?"
app.UseCors("AllowAngularDev");

// 4. Redirección HTTPS
app.UseHttpsRedirection();

// 5. Autenticación y Autorización
// Primero validamos quién eres (AuthN), luego qué puedes hacer (AuthZ)
app.UseAuthentication();
app.UseAuthorization();

// 6. Mapear los Endpoints
app.MapControllers();

// ==================================================================
// 5. EJECUCIÓN
// ==================================================================
app.Run();