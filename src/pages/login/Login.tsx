import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from "@/context/ToastContext";
import './login.css';

// Esquema de validación con Zod
const loginSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Only letters, numbers and underscores are allowed" }),
  password: z.string()
    .min(3, { message: "Password must be at least 3 characters long" })
    .max(30, { message: "Password cannot exceed 30 characters" }),
  remember: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => { 
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    if (!auth) return;

    setIsLoading(true);
    setServerError("");

    try {
      const {success, userData} = await auth.login(data.username, data.password);
      if (success) {
        reset();
               // Toast de bienvenida
               showToast(`Welcome, ${userData?.name}! 👋`);
        navigate('/profile');
      } else {
        setServerError("Incorrect credentials");
      }
    } catch (error) {
      setServerError("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Nombre de usuario: ', auth?.user?.name);

  return (
    <>
      <div className="formContainer"> 
        <div className="formWrapper">
          <h2 className='loginTitle'>Log in !</h2>
          <form 
            className="max-w-sm mx-auto loginForm" 
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Campo Username con espacio reservado para error */}
            <div className="mb-2 h-24"> {/* Altura fija */}
              <input
                type="text"
                id="username"
                placeholder='User'
                className={`formInput border ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                {...register("username")}
                autoComplete="username"
              />
              <div className="h-6 mt-1"> {/* Espacio reservado */}
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>
            
            {/* Campo Password con espacio reservado para error */}
            <div className="mb-2 h-24"> {/* Altura fija */}
              <input
                type="password"
                id="password"
                placeholder='Password'
                className={`formInput border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                {...register("password")}
                autoComplete="current-password"
              />
              <div className="h-6 mt-1"> {/* Espacio reservado */}
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
            
            {/* Checkbox Remember Me */}
        {/*     <div className="flex items-start mb-0 h-10"> 
              <div className="flex items-center h-5">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                  {...register("remember")}
                />
              </div>
              <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div> */}
            
            {/* Botón Submit y espacio para error del servidor */}
            <div className="mb-0 h-16"> {/* Altura fija para botón + error */}
              <button
                type="submit"
                className="submitButton text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
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
                ) : "Submit"}
              </button>
              
                  </div>      

            <div className="h-1 mb-3 mt-0 serverErrorContainer"> {/* Espacio reservado para error del servidor */}
                {serverError && (
                  <div className="text-sm p-2 rounded-md serverErrorMessage">
                    {serverError}
                  </div>
                )}
              </div>
            
            {/* Enlace para registro */}
            <div className="notRegister text-sm font-medium text-gray-500 text-center">
              Not registered? <Link to="/signup" className="text-blue-700 hover:underline dark:text-blue-500">Create account</Link>
            </div>

        
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;