import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from "axios";
import "./signup.css";

// Esquema de validación con Zod
const signupSchema = z.object({
  username: z.string()
    .min(3, { message: "El usuario debe tener al menos 3 caracteres" })
    .max(20, { message: "El usuario no puede exceder los 20 caracteres" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Solo se permiten letras, números y guiones bajos" }),
  password: z.string()
    .min(3, { message: "La contraseña debe tener al menos 90 caracteres" })
    .max(30, { message: "La contraseña no puede exceder los 30 caracteres" }),
  repeatPassword: z.string()
}).refine(data => data.password === data.repeatPassword, {
  message: "Las contraseñas no coinciden",
  path: ["repeatPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        name: data.username,
        password: data.password
      });
      console.log("Usuario registrado:", res.data);
      reset();
      navigate("/login");
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper2">
        <h2 className="loginTitle2">Sign up!</h2>
        
        <form className="max-w-sm mx-auto loginForm" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Campo Username */}
          <div className="mb-2 h-24">
            <input
              type="text"
              id="username"
              placeholder="User"
              className={`formInput border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              {...register("username")}
              autoComplete="username"
            />
            <div className="h-6 mt-1">
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* Campo Password */}
          <div className="mb-2 h-24">
            <input
              type="password"
              id="password"
              placeholder="Password"
              className={`formInput border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              {...register("password")}
              autoComplete="new-password"
            />
            <div className="h-6 mt-1">
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Campo Repeat Password */}
          <div className="mb-3 h-24">
            <input
              type="password"
              id="repeatPassword"
              placeholder="Repeat Password"
              className={`formInput border ${
                errors.repeatPassword ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              {...register("repeatPassword")}
              autoComplete="new-password"
            />
            <div className="h-6 mt-1">
              {errors.repeatPassword && (
                <p className="text-sm text-red-600">{errors.repeatPassword.message}</p>
              )}
            </div>
          </div>

          {/* Botón y espacio para error del servidor */}
          <div className="mb-2 h-18">
            <button
              type="submit"
              className="submitButton text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full px-5 py-2.5 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Register"}
            </button>
            
            <div className="h-1 mt-2 serverErrorContainer2">
              {serverError && (
                <div className="text-sm text-red-600 p-2 rounded-md serverErrorMessage2">
                  {serverError}
                </div>
              )}
            </div>
          </div>

        <p className="notRegister text-sm font-medium text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-700 hover:underline">Log in</Link>
        </p>
        </form>
        
      </div>
    </div>
  );
};

export default Signup;