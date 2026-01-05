using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace UrbanInk.Api.Infrastructure.Extensions
{
    public static class ModelBuilderExtensions
    {
        // Este método recorre TODAS las tablas y columnas y les cambia el nombre
        public static void UseSnakeCaseNames(this ModelBuilder modelBuilder)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // 1. Convertir nombre de Tabla (UserAddresses -> user_addresses)
                var tableName = entity.GetTableName();
                if (!string.IsNullOrEmpty(tableName))
                {
                    entity.SetTableName(tableName.ToSnakeCase());
                }

                // 2. Convertir nombre de Columnas (FirstName -> first_name)
                foreach (var property in entity.GetProperties())
                {
                    var columnName = property.GetColumnName(); // Solo columnas mapeadas a BBDD
                    property.SetColumnName(columnName.ToSnakeCase());
                }

                // 3. Convertir Claves Primarias y Foráneas (Optional, pero recomendado para consistencia)
                foreach (var key in entity.GetKeys())
                {
                    key.SetName(key.GetName()?.ToSnakeCase());
                }

                foreach (var key in entity.GetForeignKeys())
                {
                    key.SetConstraintName(key.GetConstraintName()?.ToSnakeCase());
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(index.GetDatabaseName()?.ToSnakeCase());
                }
            }
        }

        // Método auxiliar con Regex para convertir el texto
        private static string ToSnakeCase(this string input)
        {
            if (string.IsNullOrEmpty(input)) return input;

            // Regex: Busca mayúsculas y les pone un guion bajo antes, luego todo a minúsculas
            var startUnderscores = Regex.Match(input, @"^_+");
            return startUnderscores + Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToLower();
        }
    }
}