# Modelos y Controladores de StockFlow

Este documento proporciona una visión completa y detallada de todos los modelos y controladores utilizados en el backend de StockFlow.

## Modelos

Los modelos representan las entidades de datos y sus relaciones en el sistema StockFlow. Todos los modelos extienden la clase base `Model` de Laravel y se encuentran en el directorio `app/Models`.

### Características Comunes de los Modelos

- **Traits Utilizados**: 
  - `HasFactory`: Para la creación de factories en pruebas
  - `LogsActivity`: Para el registro automático de cambios (auditoría)
  - `SoftDeletes`: Para la eliminación lógica (solo en algunos modelos)

- **Relaciones**:
  - Los modelos implementan relaciones Eloquent como `belongsTo`, `hasMany`, `belongsToMany`
  - Las relaciones están correctamente definidas para mantener la integridad referencial

- **Auditoría**:
  - Implementada con el paquete `spatie/laravel-activitylog`
  - Método `getActivitylogOptions()` configurado en cada modelo para determinar qué campos se auditan

### Modelos Principales

#### Usuario

```php
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, LogsActivity;

    protected $fillable = [
        'nombre', 'email', 'password', 'telefono', 'rol_id', 'sede_id',
        'activo', 'ultimo_acceso', 'notificaciones_email', 'notificaciones_push',
        'recordatorios_stock', 'metodo_pago', 'moneda', 'idioma', 'zona_horaria',
        'tema', 'densidad'
    ];

    protected $hidden = ['password', 'remember_token'];

    // Relaciones con Rol, Sede, Auditorias, Compras, Ventas, Movimientos
}
```

**Particularidades**:
- Extiende `Authenticatable` para soportar autenticación con Laravel Sanctum
- Utiliza `SoftDeletes` para permitir la recuperación de usuarios eliminados
- Configura notificaciones para broadcast
- Gestiona preferencias de usuario como tema, idioma y configuraciones de notificaciones

#### Producto

```php
class Producto extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'nombre', 'sku', 'tipo_producto', 'descripcion', 
        'categoria_id', 'marca_id', 'stock_minimo'
    ];

    // Relaciones con Categoria, Marca, Sedes, Transferencias, CompraDetalles, VentaDetalles, Movimientos
}
```

**Particularidades**:
- Relación pivote con Sedes que incluye atributos adicionales (stock, precios)
- Información de stock distribuida por sede
- Control de stock mínimo para alertas automáticas

#### Compra

```php
class Compra extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'proveedor_id', 'usuario_id', 'sede_id', 'total', 'estado', 'factura_url'
    ];

    protected $casts = ['total' => 'decimal:2'];

    // Relaciones con Proveedor, Usuario, Sede, Detalles
    
    public function puedeCambiarEstado($nuevoEstado) 
    {
        // Lógica para validar cambios de estado
    }
}
```

**Particularidades**:
- Control de estados mediante método personalizado
- Soporte para URL de factura
- Formato decimal para totales monetarios

#### Venta

```php
class Venta extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'usuario_id', 'total', 'sede_id', 'factura_url'
    ];

    // Relaciones con Usuario, Sede, Detalles
}
```

**Particularidades**:
- Registro de ventas con total y sede
- Generación de facturas con URL almacenada
- Relación con detalles de venta para los productos vendidos

#### Sede

```php
class Sede extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'nombre', 'direccion', 'telefono', 'email', 'estado'
    ];

    // Relaciones con Productos, Usuarios, Transferencias, Ventas, Compras
}
```

**Particularidades**:
- Punto central para gestión de stock por ubicación
- Múltiples relaciones bidireccionales para transferencias (origen/destino)
- Permite activación/desactivación mediante estado

#### Role

```php
class Role extends Model
{
    use HasFactory;

    protected $fillable = ['nombre'];

    // Relación con Usuarios
}
```

**Particularidades**:
- Modelo simple para gestión de roles de usuario
- Base para el sistema de permisos

#### Categoria

```php
class Categoria extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'descripcion'];

    // Relación con Productos
}
```

**Particularidades**:
- Clasificación principal de productos
- Relación uno a muchos con productos

#### Marca

```php
class Marca extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'descripcion'];

    // Relación con Productos
}
```

**Particularidades**:
- Fabricantes de productos
- Permite filtrado y agrupación

#### Proveedor

```php
class Proveedor extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre', 'contacto', 'email', 'telefono', 'direccion', 'estado'
    ];

    // Relación con Compras
}
```

**Particularidades**:
- Registro de datos de contacto de proveedores
- Posibilidad de desactivar mediante estado
- Asociación con compras realizadas

#### Transferencia

```php
class Transferencia extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'producto_id', 'cantidad', 'sede_origen_id', 
        'sede_destino_id', 'estado', 'fecha', 'usuario_id'
    ];

    public $timestamps = false;

    // Relaciones con Producto, SedeOrigen, SedeDestino, Usuario
}
```

**Particularidades**:
- Gestión manual de la fecha sin usar timestamps automáticos
- Control de estado (pendiente, completada, cancelada)
- Identificación de sedes origen y destino

#### Movimiento

```php
class Movimiento extends Model
{
    use HasFactory;

    protected $fillable = [
        'producto_id', 'tipo', 'cantidad', 'descripcion',
        'usuario_id', 'fecha', 'sede_id', 'sede_origen_id', 'sede_destino_id'
    ];

    public $timestamps = false;

    // Relaciones con Producto, Usuario, Sede, SedeOrigen, SedeDestino
}
```

**Particularidades**:
- Registro detallado de todos los cambios de stock
- Tipos de movimiento (entrada, salida, transferencia, ajuste)
- Descripción textual del motivo del movimiento

#### VentaDetalle

```php
class VentaDetalle extends Model
{
    use HasFactory;

    protected $fillable = [
        'venta_id', 'producto_id', 'cantidad', 'precio_unitario'
    ];

    public $timestamps = false;

    // Relaciones con Venta, Producto
}
```

**Particularidades**:
- Registro del precio en el momento de la venta
- Sin timestamps para optimizar almacenamiento

#### CompraDetalle

```php
class CompraDetalle extends Model
{
    use HasFactory;

    protected $fillable = [
        'compra_id', 'producto_id', 'cantidad', 'precio_unitario'
    ];

    public $timestamps = false;

    // Relaciones con Compra, Producto
}
```

**Particularidades**:
- Registro del precio de compra para cálculo de márgenes
- Sin timestamps para optimizar almacenamiento

#### Auditoria

```php
class Auditoria extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'activity_log';

    protected $fillable = [
        'log_name', 'description', 'subject_type', 'subject_id',
        'causer_type', 'causer_id', 'properties', 'created_at'
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime'
    ];

    // Relación con Usuario (causer)
}
```

**Particularidades**:
- Utiliza tabla activity_log del paquete spatie/laravel-activitylog
- Almacena propiedades como array JSON
- Guarda relación con el usuario que causó la actividad

## Controladores

Los controladores gestionan las solicitudes HTTP y la lógica de negocio. Se encuentran en `app/Http/Controllers/API` siguiendo el patrón RESTful.

### Características Comunes de los Controladores

- **Estructura**: Siguen el patrón CRUD (Create, Read, Update, Delete)
- **Validación**: Utilizan el sistema de validación de Laravel con `Validator`
- **Transacciones**: Implementan transacciones de base de datos para operaciones complejas
- **Respuestas**: Devuelven respuestas JSON estructuradas con códigos HTTP apropiados

### Controladores Principales

#### ProductoController

```php
class ProductoController extends Controller
{
    // Métodos CRUD estándar (index, store, show, update, destroy)
    
    // Métodos adicionales específicos
    public function getProductsBySede($sedeId) { /* ... */ }
    public function getLowStockProducts(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Gestiona el stock distribuido por sede
- Implementa notificaciones de stock bajo
- Carga relaciones (eager loading) para optimizar consultas
- Maneja transacciones para garantizar consistencia

#### UsuarioController

```php
class UsuarioController extends Controller
{
    // Métodos CRUD estándar
    
    // Métodos de autenticación
    public function register(Request $request) { /* ... */ }
    public function login(Request $request) { /* ... */ }
    public function logout(Request $request) { /* ... */ }
    public function me(Request $request) { /* ... */ }
    
    // Métodos específicos
    public function restore($id) { /* ... */ }
    public function trashed() { /* ... */ }
    public function cambiarEstado(Request $request, Usuario $usuario) { /* ... */ }
    public function updatePassword(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Gestión completa de autenticación con Sanctum
- Soporte para soft delete (eliminación lógica) y restauración
- Gestión de perfiles y cambios de estado
- Recuperación de información del usuario autenticado

#### DashboardController

```php
class DashboardController extends Controller
{
    public function getStats(Request $request) { /* ... */ }
    public function getVentasPorMes(Request $request) { /* ... */ }
    public function getProductosMasVendidos(Request $request) { /* ... */ }
    public function getProductosStockBajo(Request $request) { /* ... */ }
    public function getUltimasVentas(Request $request) { /* ... */ }
    public function getUltimasCompras(Request $request) { /* ... */ }
    public function getUltimosMovimientos(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Genera estadísticas y métricas para el dashboard
- Implementa filtrado por sede
- Utiliza manejo avanzado de errores y logging
- Procesamiento de datos para gráficos y visualizaciones

#### CompraController

```php
class CompraController extends Controller
{
    // Métodos CRUD estándar
    
    // Métodos específicos
    public function getByDateRange(Request $request) { /* ... */ }
    public function getResumen(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Gestión de compras con detalles en transacción
- Filtrado por rango de fechas
- Generación de resúmenes para reportes
- Integración con sistema de notificaciones

#### VentaController

```php
class VentaController extends Controller
{
    // Métodos CRUD estándar
    
    // Métodos específicos
    public function getByDateRange(Request $request) { /* ... */ }
    public function getResumen(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Procesamiento de ventas con actualización automática de stock
- Filtrado por fecha para reportes
- Cálculo de totales y aplicación de descuentos
- Generación de facturas

#### TransferenciaController

```php
class TransferenciaController extends Controller
{
    // Métodos CRUD estándar
    
    // Métodos específicos para gestionar estados
}
```

**Particularidades**:
- Control de transferencias entre sedes
- Validación de stock disponible
- Actualización automática de inventario en ambas sedes
- Registro de movimientos asociados

#### AuditoriaController

```php
class AuditoriaController extends Controller
{
    public function index(Request $request) { /* ... */ }
    public function show($id) { /* ... */ }
    public function getAcciones() { /* ... */ }
    public function getTablas() { /* ... */ }
}
```

**Particularidades**:
- Consulta de registros de actividad
- Filtrado avanzado por usuario, acción, tabla y fecha
- Obtención de metadatos para filtros

#### SedeController

```php
class SedeController extends Controller
{
    // Métodos CRUD estándar
}
```

**Particularidades**:
- Gestión de sedes/sucursales
- Validación de datos de contacto
- Control de estado (activo/inactivo)

#### MarcaController / CategoriaController

```php
class MarcaController extends Controller
{
    // Métodos CRUD estándar
}
```

**Particularidades**:
- Gestión de taxonomías para productos
- Validación básica de nombres únicos
- Carga de relaciones al listar

#### ProveedorController

```php
class ProveedorController extends Controller
{
    // Métodos CRUD estándar
    
    // Método específico
    public function getResumenCompras(Request $request, Proveedor $proveedor) { /* ... */ }
}
```

**Particularidades**:
- Gestión de datos de proveedores
- Generación de resúmenes de compras por proveedor
- Validación de datos de contacto

#### MovimientoController

```php
class MovimientoController extends Controller
{
    // Métodos CRUD estándar
    
    // Métodos específicos
    public function getByDateRange(Request $request) { /* ... */ }
    public function getByProducto($productoId) { /* ... */ }
    public function getBySede($sedeId) { /* ... */ }
    public function getResumen(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Registro detallado de movimientos de stock
- Filtrado por múltiples criterios
- Generación de reportes de actividad

#### NotificationController

```php
class NotificationController extends Controller
{
    public function index() { /* ... */ }
    public function markAsRead($id) { /* ... */ }
    public function markAllAsRead() { /* ... */ }
    public function destroy($id) { /* ... */ }
    public function destroyAll() { /* ... */ }
}
```

**Particularidades**:
- Gestión de notificaciones de usuario
- Marcado como leído individual o masivo
- Eliminación selectiva o completa

#### FacturaController

```php
class FacturaController extends Controller
{
    public function index() { /* ... */ }
    public function generarFacturaVenta($id) { /* ... */ }
    public function generarFacturaCompra($id) { /* ... */ }
    public function descargarFactura($tipo, $id) { /* ... */ }
}
```

**Particularidades**:
- Generación de facturas en PDF con DomPDF
- Plantillas HTML para documentos
- Almacenamiento y descarga de facturas

#### ConfigController

```php
class ConfigController extends Controller
{
    public function index() { /* ... */ }
    public function updatePerfil(Request $request) { /* ... */ }
    public function updateSeguridad(Request $request) { /* ... */ }
    public function updatePago(Request $request) { /* ... */ }
    public function updateIdioma(Request $request) { /* ... */ }
    public function updateApariencia(Request $request) { /* ... */ }
    public function updatePassword(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Gestión de configuraciones de usuario
- Actualización segmentada por categorías
- Validación específica por tipo de configuración

#### MessageController

```php
class MessageController extends Controller
{
    public function sendToUser(Request $request) { /* ... */ }
    public function sendToSede(Request $request) { /* ... */ }
    public function sendToAll(Request $request) { /* ... */ }
}
```

**Particularidades**:
- Sistema de mensajería interna
- Envío a usuarios específicos, sedes completas o toda la organización
- Integración con sistema de notificaciones

#### RoleController

```php
class RoleController extends Controller
{
    // Métodos CRUD estándar para gestión de roles
    public function index() { /* ... */ }
    public function store(Request $request) { /* ... */ }
    public function show(Role $role) { /* ... */ }
    public function update(Request $request, Role $role) { /* ... */ }
    public function destroy(Role $role) { /* ... */ }
}
```

**Particularidades**:
- Gestión de roles del sistema (Administrador, Vendedor, Almacenista)
- Validación simple de nombres de roles
- Controlador básico CRUD sin lógica compleja adicional

#### CompraDetalleController

```php
class CompraDetalleController extends Controller
{
    // Métodos CRUD estándar
    
    // Métodos específicos
    public function getByCompra($compraId) { /* ... */ }
    public function getByProducto($productoId) { /* ... */ }
}
```

**Particularidades**:
- Control de líneas individuales de compra
- Actualizaciones del total de compra en transacción
- Validación de estado de compra antes de permitir modificaciones
- Métodos para obtener detalles filtrados por compra o producto

#### VentaDetalleController

```php
class VentaDetalleController extends Controller
{
    // Métodos CRUD estándar y específicos para gestionar los detalles de venta
}
```

**Particularidades**:
- Gestión de líneas individuales de venta
- Actualización de totales en transacción
- Recálculo automático de importes al modificar cantidades o precios

## Patrones y Buenas Prácticas

### Arquitectura

- **Separación de Responsabilidades**: Los modelos gestionan los datos y relaciones, mientras los controladores manejan la lógica de negocio
- **Principio DRY**: Uso de helpers y métodos compartidos para evitar duplicación de código
- **RESTful API**: Estructura uniforme de endpoints siguiendo convenciones REST

### Seguridad

- **Validación Robusta**: Todos los inputs son validados antes de procesarse
- **Manejo de Transacciones**: Las operaciones complejas utilizan transacciones para mantener la integridad
- **Control de Acceso**: Rutas protegidas mediante middleware de autenticación
- **Hashing de Contraseñas**: Uso automático de bcrypt para almacenamiento seguro

### Optimización

- **Eager Loading**: Carga de relaciones optimizada para reducir consultas N+1
- **Paginación**: Implementada en listados para mejorar rendimiento
- **Cacheo**: Aplicado en consultas intensivas como las del dashboard
- **Índices de Base de Datos**: Implementados en columnas frecuentemente consultadas

### Auditoría y Registro

- **Logging Detallado**: Uso extensivo de Log::info/error para depuración
- **Registro de Actividad**: Seguimiento de cambios en modelos principales
- **Excepciones Controladas**: Manejo estructurado de errores con mensajes claros
- **Notificaciones Automáticas**: Alertas en eventos críticos como stock bajo

### Convenciones de Código

- **PSR-12**: Seguimiento de estándares de codificación PHP
- **DocBlocks**: Documentación en métodos críticos
- **Convenciones de Nomenclatura**: Uso consistente en modelos, controladores y variables
- **Tipos de Retorno**: Respuestas JSON con estructuras consistentes

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

- **Modularidad**: Componentes con responsabilidades claramente definidas
- **Traits Reutilizables**: Funcionalidades comunes extraídas a traits
- **Middleware Personalizable**: Controles de acceso configurables
- **Helpers Centralizados**: Funciones de utilidad en clases helper específicas

Este diseño permite adaptar el sistema a nuevas necesidades comerciales manteniendo la calidad y robustez del código. 
