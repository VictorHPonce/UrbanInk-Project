# ETAPA 1: BUILD (Usamos el SDK 10.0)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos el csproj y restauramos dependencias
COPY ["UrbanInk.Api.csproj", "./"]
RUN dotnet restore "UrbanInk.Api.csproj"

# Copiamos todo el código fuente
COPY . .

# Publicamos en modo Release
RUN dotnet publish "UrbanInk.Api.csproj" -c Release -o /app/publish

# ETAPA 2: RUNTIME (Usamos ASP.NET Core 10.0)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copiamos los archivos compilados desde la etapa de build
COPY --from=build /app/publish .

# Necesitamos crearla para evitar errores si no existe.
RUN mkdir -p wwwroot/images/products

# Exponemos el puerto
EXPOSE 8080

# Arrancamos la API
ENTRYPOINT ["dotnet", "UrbanInk.Api.dll"]