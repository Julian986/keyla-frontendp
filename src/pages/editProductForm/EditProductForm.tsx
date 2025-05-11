import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/header/Header";
import { useNavigate, useParams } from 'react-router-dom';
import ImageRotator from "@/components/imageRotator/ImageRotator";
import "../productForm/productForm.css"
import { AuthContext } from "@/context/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Product } from '../../types/productType';
import { useToast } from "@/context/ToastContext";

// Reusing the same validation schema
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
    .min(0, "Stock cannot be negative"),
  
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

export default function EditProductForm() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showRotator, setShowRotator] = useState(false);
  const [imageToRotate, setImageToRotate] = useState<string | null>(null);
  const [dynamicSpecs, setDynamicSpecs] = useState<{key: string, value: string}[]>([]);
  const auth = useContext(AuthContext);
  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Load product data
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<Product>(
          `${import.meta.env.VITE_BACKEND_URL}/products/${productId}`
        );
        
        console.log("Reached EditProductForm")
        const product = response.data;
        console.log('Product: ', product);
        
        // Set form values
        reset({
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock,
          category: product.category,
          brand: product.brand,
          condition: product.condition,
          currencyType: product.currencyType,
          image: product.image,
          specifications: product.specifications
        });

        // Process dynamic specifications
        if (product.specifications) {
          const specsArray = Object.entries(product.specifications)
            .filter(([key]) => !['Brand', 'Model'].includes(key)) // Exclude those already in the form
            .map(([key, value]) => ({ key, value: value as string }));
          
          setDynamicSpecs(specsArray);
        }

      } catch (error) {
        console.error("Error loading product:", error);
        showToast("Error loading the product. Please try again");
        navigate('/profile');
      } finally {
        setFetching(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, reset, navigate]);

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

  const handleSaveImage = (croppedImage: string) => {
    setValue("image", croppedImage);
    trigger("image");
    setShowRotator(false);
  };

  const handleCancel = () => {
    setImageToRotate(null);
    setShowRotator(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    console.log("Submitting data:", 'productData');

      // Check for validation errors
      const isValid = await trigger();
      if (!isValid) {
        showToast("Please complete all required fields correctly");
        return;
      }

    if(!auth?.token) {
      showToast("You must log in to edit a product");
      return;
    }
    
    setLoading(true);
    
    try {
        const token = auth?.token || localStorage.getItem("token");
        
        // Prepare combined specifications
        const allSpecs = {...data.specifications};
        dynamicSpecs.forEach(spec => {
          if (spec.key && spec.value) {
            allSpecs[spec.key] = spec.value;
          }
        });
  
        // Prepare data to send
        const productData = {
          name: data.name,
          price: data.price,
          description: data.description,
          stock: data.stock,
          category: data.category,
          brand: data.brand,
          condition: data.condition,
          currencyType: data.currencyType,
          specifications: allSpecs,
          image: data.image.startsWith('data:') ? null : data.image // Don't send image if it hasn't changed
        };
  
        // If there's a new image, use FormData
            if (data.image.startsWith('data:')) {
            const formData = new FormData();
            
            // Convert all values to string before adding them
            formData.append("name", String(productData.name));
            formData.append("price", String(productData.price));
            formData.append("stock", String(productData.stock));
            formData.append("category", String(productData.category));
            formData.append("brand", String(productData.brand));
            formData.append("condition", String(productData.condition));
            formData.append("currencyType", String(productData.currencyType));
            
            if (productData.description) {
            formData.append("description", String(productData.description));
            }
            
            if (productData.specifications) {
            formData.append("specifications", JSON.stringify(productData.specifications));
            }
          
          // Add image file
          const file = await fetch(data.image)
            .then(res => res.blob())
            .then(blob => new File([blob], "product-image.png", { type: "image/png" }));
          formData.append("image", file);
          await axios.put(`${import.meta.env.VITE_BACKEND_URL}/products/${productId}`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          });
        } else {
          // No new image, send as JSON
          await axios.put(`${import.meta.env.VITE_BACKEND_URL}/products/${productId}`, productData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
        }
  
        showToast("Product updated successfully");
        navigate('/profile');
      } catch (error) {
        console.error("Error updating product:", error);
        showToast("Error updating product. Please try again.");
      } finally {
        setLoading(false);
      }
  };

  if (fetching) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8 productDetailWrapper mt-5">
          <div className="flex justify-center items-center h-64">
            <p>Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 productDetailWrapper mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-3">
          {/* Image section - editable */}
          <div className="space-y-4">
            <div className="productContainerDetail rounded-lg shadow-md overflow-hidden">
              <label htmlFor="product-image-upload" className="cursor-pointer">
                {watch("image") ? (
                  <img
                    src={watch("image") || undefined}
                    alt="Preview"
                    className="w-full h-96 object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gray-800">
                    <span className="text-gray-400">Click to upload an image</span>
                  </div>
                )}
              </label>
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>
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
                    <option value="ars">ARS</option>
                    <option value="usd">USD</option>
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
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        placeholder="Type (e.g. Color)"
                        className="w-1/2 bg-transparent border-b border-gray-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder="Value (e.g. Black)"
                        className="w-1/2 bg-transparent border-b border-gray-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-500 hover:text-red-700 text-lg"
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
              <div className="mt-8 flex space-x-4">
                <button
                  type="submit"
                  className="btBottom flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
                <button
                  type="button"
                  className="btBottom btBottom2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
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