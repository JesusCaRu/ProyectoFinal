<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UpdateUserPasswordsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todos los usuarios
        $usuarios = Usuario::all();

        // Actualizar cada usuario
        foreach ($usuarios as $usuario) {
            // Si la contraseña no está hasheada con Bcrypt, la hasheamos
            if (!Hash::isHashed($usuario->password)) {
                // Actualizamos directamente en la base de datos para evitar eventos del modelo
                DB::table('usuarios')
                    ->where('id', $usuario->id)
                    ->update(['password' => Hash::make($usuario->password)]);
            }
        }

        $this->command->info('Contraseñas de usuarios actualizadas correctamente.');
    }
}
