keyla

- Usar alguna herramienta para reducir el tamaño de las imagenes asi funciona mas rapida la pagina

 Aceternity UI: 
- Background gadient
- background lines
- githubglobes


 Fondo bueno: #050505

 Tasks

 - boton✅
 - menu✅
 - Sidebar

 Optimizar la app 
 - Comprobar si no funcionan y borrar tailwind.config.js y .app.json
 - desinstalar bootstrap


    Elegir metodo de pago
    Slider de marcas
    Animated Testimonials (aceternity)
    Timeline para mostrar versionados de la app (aceternity)


Github Globes
Medidas por default del canva que envuelve el globo
   width: 1000.01px;
   height: 559.98px;

Desinstalar: 

npm uninstall react-easy-crop en el backend




    // Define Zod schema for product validation
    const productSchema = z.object({
      name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),
      
      price: z.string()
        .min(1, "El precio es requerido")
        .refine(val => !isNaN(Number(val)), {
          message: "Debe ser un número válido"
        })
        .transform(val => Number(val))
        .refine(val => val > 0, {
          message: "El precio debe ser mayor que 0"
        }),
      
      description: z.string()
        .max(1000, "La descripción no puede exceder los 1000 caracteres")
        .optional(),
      
      stock: z.string()
        .min(1, "El stock es requerido")
        .refine(val => !isNaN(Number(val)) && Number.isInteger(Number(val)), {
          message: "Debe ser un número entero válido"
        })
        .transform(val => Number(val))
        .refine(val => val >= 0, {
          message: "El stock no puede ser negativo"
        }),
      
      category: z.string().min(1, "La categoría es requerida"),
      brand: z.string().min(1, "La marca es requerida"),
      condition: z.enum(["new", "used"]),
      currencyType: z.enum(["ars", "usd"]),
      image: z.string().min(1, "La imagen es requerida").nullable(),
      specifications: z.record(z.string()).optional()
    });