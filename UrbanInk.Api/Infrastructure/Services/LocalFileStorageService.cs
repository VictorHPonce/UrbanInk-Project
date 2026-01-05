using UrbanInk.Api.Application.Interfaces;

namespace UrbanInk.Api.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LocalFileStorageService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string containerName)
        {
            // 1. Guardar archivo físico
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            string folder = Path.Combine(_env.WebRootPath, containerName);

            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            string route = Path.Combine(folder, fileName);

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                await File.WriteAllBytesAsync(route, ms.ToArray());
            }

            // 2. Generar URL pública (ej: https://localhost:7100/images/products/foto.jpg)
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                throw new InvalidOperationException("No se puede obtener HttpContext.");
            }
            var url = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
            var routeForDb = Path.Combine(url, containerName, fileName).Replace("\\", "/");

            return routeForDb;
        }

        public Task DeleteFileAsync(string fileRoute, string containerName)
        {
            if (string.IsNullOrEmpty(fileRoute))
            {
                return Task.CompletedTask;
            }

            // fileRoute es la URL completa. Necesitamos sacar solo el nombre del archivo.
            var fileName = Path.GetFileName(fileRoute);
            var directory = Path.Combine(_env.WebRootPath, containerName, fileName);

            if (File.Exists(directory))
            {
                File.Delete(directory);
            }

            return Task.CompletedTask;
        }
    }
}