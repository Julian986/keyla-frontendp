import { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/header/Header";
import Footer from "../../components/Footer/Footer";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MapPin } from "lucide-react";
import "./userForm.css";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";

// Updated Zod validation schema
const userSchema = z.object({
  name: z.string()
    .min(3, { message: "Name must have at least 3 characters" })
    .max(30, { message: "Name cannot exceed 30 characters" })
    .refine(
      (val) => !/^\d+$/.test(val),
      { message: "Name cannot contain only numbers" }
    ),
  email: z.string()
    .max(50, { message: "Email cannot exceed 50 characters" })
    .superRefine((val, ctx) => {
      if (!val || val.trim() === '') return;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email",
        });
      }

      if (val.includes('@') && !val.split('@')[1].includes('.')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email domain seems invalid",
        });
      }
    })
    .optional()
    .transform(val => val?.trim().toLowerCase()),
  description: z.string()
    .max(200, { message: "Description cannot exceed 200 characters" })
    .optional(),
  image: z.string()
    .url({ message: "Enter a valid URL" })
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(50, { message: "Location cannot exceed 50 characters" })
    .optional(),
  phone: z.string()
    .max(20, { message: "Phone number cannot exceed 20 characters" })
    .superRefine((val, ctx) => {
      if (!val || val.trim() === '') return;

      const cleanPhone = val.replace(/\s/g, '');

      if (!/^\+?[0-9\-\s]{8,20}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid phone format. Valid examples: +34 123 456 789, 912345678",
        });
        return;
      }

      const digitCount = cleanPhone.replace(/[^0-9]/g, '').length;
      if (digitCount < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 8,
          type: "string",
          inclusive: true,
          message: "Phone number must have at least 8 digits",
        });
      }

      if (cleanPhone.startsWith('+') && cleanPhone.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "International numbers must be longer (include country code)",
        });
      }
    })
    .optional()
    .transform(val => val?.trim())
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserForm() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [previewImage, setPreviewImage] = useState(authContext?.user?.image || '/default-user.jpg');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  });

  useEffect(() => {
    if (!authContext?.token) {
      navigate("/Profile");
    }
  }, [authContext?.token, navigate]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    const alreadyWarned = sessionStorage.getItem("authUser-toast-shown");
    if (!authContext?.token && !alreadyWarned) {
      showToast("You must log in to chat with the seller", {
        backgroundColor: "#FFF",
        textColor: "grey"
      });
      sessionStorage.setItem("authUser-toast-shown", "true");
    }
  }, [authContext?.token]);

  useEffect(() => {
    if (authContext?.user) {
      const { user } = authContext;
      setValue('name', user.name || "");
      setValue('email', user.email || "");
      setValue('description', user.description || "");
      setValue('image', user.image || "");
      setValue('location', user.location || "");
      setValue('phone', user.phone || "");
    }
  }, [authContext?.user, setValue]);

  const onSubmit = async (data: UserFormData) => {
    if (!authContext?.token || !authContext.user){
      showToast("You must log in to edit your profile");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.description) formData.append('description', data.description);
      if (data.phone) formData.append('phone', data.phone);
      if (data.location) formData.append('location', data.location);

      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append('image', fileInput.files[0]);
      } else if (data.image && data.image.startsWith('blob:')) {
        console.log('Ignoring temporary image URL');
      }

      console.log('Sending update request with:', {
        name: data.name,
        hasImage: !!fileInput?.files?.[0]
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/user/update`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${authContext.token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (authContext.updateUser && response.data.user) {
        authContext.updateUser({
          ...response.data.user,
          location: response.data.user.location || '',
          phone: response.data.user.phone || ''
        });
      }

      showToast("Profile updated successfully");
      reset(response.data.user);

      setTimeout(() => {
      navigate("/Profile");
    }, 100);
    } catch (err: any) {
      console.error("Update error:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });

      const errorMsg = err.response?.data?.message ||
                      err.response?.data?.error ||
                      "Error updating the data"

      setServerError(errorMsg);
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!authContext) {
    return <div className="text-white text-center py-10">Unauthorized</div>;
  }

  const getLocationFromCoords = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      return data.address.city && data.address.country
        ? `${data.address.city}, ${data.address.country}`
        : data.display_name || null;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  };
  
  return (
    <>
      <Header />

      <div className="productContainer flex items-center justify-center min-h-screen p-6">
        <div className="productForm w-full max-w-3xl p-6 shadow-lg rounded-2xl">
          <h2 className="productFormTitle text-xl font-semibold text-gray-800 mb-4">
            Edit User
          </h2>
          
          {serverError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="userForm">

            {/* Campo Imagen */}

<div className="flex items-center gap-4 mb-4 h-32">
  <label htmlFor="imageUpload" className="cursor-pointer">
    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500 hover:opacity-80 transition">
      <img
        src={previewImage}
        alt="Usuario"
        className="w-full h-full object-cover rounded-full"
      />
    </div>
  </label>
  
  <input
    id="imageUpload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
        // Si estás usando react-hook-form para guardar la imagen:
        setValue("image", imageUrl); // Guardamos la url temporal
      }
    }}
  />

  <div className="flex-1">
    <p className="text-sm text-gray-600">
      Click on the image to choose a file.
    </p>
    {errors.image && (
      <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
    )}
  </div>
</div>


            {/* Campos del formulario */}
            <div className="elDivForm grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  className="border p-2 rounded productoInput w-full"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

                 {/* Teléfono */}
                 <div>
                <input
                  type="text"
                  placeholder="Phone"
                  className="border p-2 rounded productoInput w-full"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Ubicación */}
              <div>
                <input
                  type="text"
                  placeholder="Location (Ex: City, Country)"
                  className="border p-2 rounded productoInput w-full"
                  {...register("location")}
                />

<button
  type="button"
  className="useUbication flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
  onClick={async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = await getLocationFromCoords(latitude, longitude);
        if (locationText) {
          setValue("location", locationText);
          showToast("Location detected");
        } else {
          showToast("Could not determine the location");
        }
      },
      () => showToast("Could not get your location"),
      { enableHighAccuracy: true }
    );
  }}
>
  <MapPin className="w-4 h-4" />
  Use my location
</button>

                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="text"
                  placeholder="Email"
                  className="border p-2 rounded productoInput w-full"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Description"
                  className="border p-2 rounded productoInput w-full"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Botón de envío */}
            <div className="mt-6 h-16">
              <button
                type="submit"
                className="botonActualizarUsuario w-full bg-blue-500 text-white hover:bg-blue-600 rounded-lg py-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : "Update User"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}