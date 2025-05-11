import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/header/Header";
import { useNavigate } from 'react-router-dom';
import ImageRotator from "@/components/imageRotator/ImageRotator";
import "./productForm.css";
import { AuthContext } from "@/context/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/context/ToastContext";

// Define Zod schema for product validation
const productSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),
  
  price: z.coerce.number()
    .min(0.01, "Price must be greater than 0"),
  
  description: z.string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  
  stock: z.coerce.number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .min(1, "Indicate the stock"),
  
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  condition: z.enum(["New", "Used"]),
  currencyType: z.enum(["ars", "usd"]),
  image: z.string()
    .min(1, "Image is required")
    .refine((val) => val !== "null" && val !== "", {
      message: "Image is required"
    }),

  specifications: z.record(z.string()).optional()
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    control
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: undefined,
      description: "",
      stock: undefined,
      category: "",
      brand: "",
      condition: "Used",
      currencyType: "ars",
      specifications: {},
      image: ""
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [showRotator, setShowRotator] = useState(false);
  const [imageToRotate, setImageToRotate] = useState<string | null>(null);
  const [dynamicSpecs, setDynamicSpecs] = useState<{key: string, value: string}[]>([
    {key: "Model", value: ""}
  ]);
  const auth = useContext(AuthContext);
  const { showToast } = useToast();
  const authContext = useContext(AuthContext);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ⛔ Redirect if no token
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
    const alreadyWarned = sessionStorage.getItem("auth-toast-shown");
    if (!auth?.token && !alreadyWarned) {
      showToast("You must log in to publish a product", {
        backgroundColor: "#FFF",
        textColor: "grey" 
      });
      sessionStorage.setItem("auth-toast-shown", "true");
    }
  }, [auth?.token]);
  
  const addSpecification = () => {
    setDynamicSpecs([...dynamicSpecs, {key: "", value: ""}]);
  }
  
  const removeSpecification = (index: number) => {
    const newSpecs = [...dynamicSpecs];
    newSpecs.splice(index, 1);
    setDynamicSpecs(newSpecs);
  }

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...dynamicSpecs];
    newSpecs[index][field] = value;

    if (field === 'key' && value == '') {
      newSpecs.slice(index, 1);
    }
    setDynamicSpecs(newSpecs);
  }

  // Function to format price based on selected currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(watch("currencyType") === 'usd' ? 'en-US' : 'es-AR', {
      style: 'currency',
      currency: watch("currencyType") === 'usd' ? 'USD' : 'ARS'
    }).format(Number(price) || 0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToRotate(reader.result as string);
        setShowRotator(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToRotate(reader.result as string);
        setShowRotator(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSaveImage = (croppedImage: string) => {
    setPreviewImage(croppedImage);
    setValue("image", croppedImage);
    trigger("image");
    setShowRotator(false);
    setImageToRotate(null);
  };

  const handleCancel = () => {
    setImageToRotate(null);
    setShowRotator(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    if(!auth?.token) {
      showToast("You must log in to publish a product");
      return;
    }

    setLoading(true);

    const allSpecs = {...data.specifications};
    dynamicSpecs.forEach(spec => {
      if (spec.key && spec.value) {
        allSpecs[spec.key] = spec.value;
      }
    })

    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Add all product fields to FormData
    formData.append("name", data.name);
    formData.append("price", data.price.toString());
    formData.append("description", data.description || "");
    formData.append("stock", data.stock.toString());
    formData.append("category", data.category);
    formData.append("brand", data.brand);
    formData.append("currencyType", data.currencyType);
    formData.append("specifications", JSON.stringify(allSpecs));
    formData.append("condition", data.condition);
    
    if (data.image) {
      const file = await fetch(data.image)
        .then(res => res.blob())
        .then(blob => new File([blob], "product-image.png", { type: "image/png" }));
      formData.append("image", file);
    }

    try {               
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/products/publish`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      showToast("Product published successfully");
      navigate('/profile');
    } catch (error) {
      console.error("Error publishing product:", error);
      showToast("Error publishing product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 productDetailWrapper mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-3">
          {/* Image section - editable */}
          <div className="space-y-4">
            <div 
              className="image-upload-container group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <label htmlFor="product-image-upload" className="cursor-pointer w-full h-full">
                <div className={`upload-area ${previewImage ? 'has-image' : ''}`}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="uploaded-image"
                    />
                  ) : (
                    <div className="upload-instructions">
                      <svg className="upload-icon" viewBox="0 0 24 24">
                        <path d="M19 13a1 1 0 0 0-1 1v.38l-1.48-1.48a2.79 2.79 0 0 0-3.93 0l-.7.7-2.48-2.48a2.85 2.85 0 0 0-3.93 0L4 12.6V7a1 1 0 0 1 1-1h7a1 1 0 1 0 0-2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5a1 1 0 0 0-1-1ZM5 20a1 1 0 0 1-1-1v-3.57l2.9-2.9a.79.79 0 0 1 1.09 0l3.17 3.17 4.3 4.3H5Zm15-1a1 1 0 0 1-.18.53l-4.82-4.83a.79.79 0 0 1 0-1.09l.7-.7a.78.78 0 0 1 1.1 0L18 17.21V19Zm0-5.14-1.87-1.87a.77.77 0 0 1 0-1.1.78.78 0 0 1 1.1 0l1.88 1.91V13a1 1 0 0 0-1.11-1Z"/>
                        <path d="M8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                      </svg>
                      <p className="upload-text">Drag an image here or click to select</p>
                      <p className="upload-hint">Supported formats: JPG, PNG, GIF</p>
                    </div>
                  )}
                </div>
              </label>
              
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              
              {errors.image && (
                <p className="error-message">{errors.image.message}</p>
              )}
            </div>
          </div>

          {/* Product information - editable */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Header */}
              <div className="border-b pb-4">
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Product name"
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b border-gray-600 w-full focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Price and Currency */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: false })}
                    placeholder="Price"
                    className="text-3xl font-semibold text-white-900 bg-transparent border-b border-gray-600 w-full focus:outline-none"
                    step="any"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    {watch("price") && formatPrice(watch("price"))}
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <select
                    {...register("currencyType")}
                    className="elSelectDelDinero currencyTypeSelect mt-2 colorGrey border border-gray-600 rounded p-2 w-full focus:outline-none"
                  >
                    <option value="usd" className="monedaType">USD</option>
                    <option value="ars" className="monedaType">ARS</option>
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div className="mt-4">
                <input
                  type="number"
                  {...register("stock", { valueAsNumber: false })}
                  placeholder="Stock quantity"
                  className="text-sm bg-transparent border-b border-gray-600 w-full focus:outline-none"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="elColorsitogrey text-lg font-medium text-gray-900">Description</h2>
                <textarea
                  {...register("description")}
                  placeholder="Detailed product description"
                  className="laDescriptionDelProduct mt-2 colorGrey bg-transparent border border-gray-600 rounded p-2 w-full h-32 focus:outline-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Technical specifications */}
              <div className="mt-6">
                <h2 className="elColorsitogrey text-lg font-medium text-gray-900">Technical specifications</h2>
                
                <div className="mt-4 space-y-3">
                  {dynamicSpecs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 w-full">
                      <div className="flex-1 min-w-0 flex gap-2">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                          placeholder="Type"
                          className="w-1/2 bg-transparent border-b border-gray-600 focus:outline-none text-sm"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="w-1/2 bg-transparent border-b border-gray-600 focus:outline-none text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-500 hover:text-red-700 text-lg flex-shrink-0"
                        title="Remove specification"
                      >
                        −
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addSpecification}
                  className="elColorsitoAmarillo mt-3 flex items-center text-blue-500 hover:text-blue-700 text-sm"
                >
                  <span className="text-lg mr-1">+</span> Add specification
                </button>
              </div>

              {/* Category and Brand */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h2 className="elColorsitogrey text-lg font-medium text-gray-900">Category</h2>
                  <select
                    {...register("category")}
                    className="currencyTypeSelect mt-2 colorGrey bg-transparent border border-gray-600 rounded p-2 w-full focus:outline-none"
                  >
                    <option value="" disabled hidden>Select a category</option>
                    <option value="Components">Components</option>
                    <option value="Peripherals & Setup">Peripherals & Setup</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Mobile Devices">Mobile Devices</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
                <div>
                  <h2 className="elColorsitogrey text-lg font-medium text-gray-900">Condition</h2>
                  <select
                    {...register("condition")}
                    className="currencyTypeSelect mt-2 colorGrey bg-transparent border border-gray-600 rounded p-2 w-full focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
                <div>
                  <h2 className="elColorsitogrey text-lg font-medium text-gray-900">Brand</h2>
                  <input
                    type="text"
                    {...register("brand")}
                    placeholder="Product brand"
                    className="laMarquita mt-2 colorGrey bg-transparent border border-gray-600 rounded p-2 w-full focus:outline-none"
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-500">{errors.brand.message}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex space-x-4">
                <button
                  type="submit"
                  className="btBottom flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Publishing...' : 'Publish Product'}
                </button>
                <button
                  type="button"
                  className="btBottom btBottom2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showRotator && imageToRotate && (
        <div className="rotator-modal">
          <ImageRotator
            image={imageToRotate}
            onSave={handleSaveImage}
            onCancel={handleCancel}
          />
        </div>
      )}
    </>
  );
}