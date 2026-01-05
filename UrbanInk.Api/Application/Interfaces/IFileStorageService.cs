namespace UrbanInk.Api.Application.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string containerName);
        Task DeleteFileAsync(string fileRoute, string containerName);
    }
}
