import z from "zod"

export const carSchema = z.object({
    brand: z.string().min(1, 'Brand is required').max(50, 'Brand is too long'),
    model: z.string().min(1, 'Model is required').max(50, 'Model is too long'),
    year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    color: z.string().min(1, 'Color is required').max(30, 'Color is too long'),
    licensePlate: z.string().min(1, 'License plate is required').max(20, 'License plate is too long'),
    vin: z.string().max(17, 'VIN must be 17 characters or less').optional(),
    transmission: z.enum(['AUTOMATIC', 'MANUAL']),
    fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']),
    seats: z.number().min(1, 'At least 1 seat').max(20, 'Too many seats'),
    doors: z.number().min(2, 'At least 2 doors').max(6, 'Too many doors'),
    engineCapacity: z.number().min(0, 'Must be positive').optional(),
    horsePower: z.number().min(0, 'Must be positive').optional(),
    mileage: z.number().min(0, 'Mileage cannot be negative'),
    pricePerDay: z.number().min(0, 'Price cannot be negative'),
    pricePerHour: z.number().min(0, 'Price cannot be negative').optional(),
    deposit: z.number().min(0, 'Deposit cannot be negative'),
    description: z.string().max(1000, 'Description is too long').optional(),
    location: z.string().min(1, 'Location is required').max(100, 'Location is too long'),
    features: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    categoryId: z.string(),
latitude: z.number().optional(),
longitude: z.number().optional(),
  })
  
export type CarFormData = z.infer<typeof carSchema>