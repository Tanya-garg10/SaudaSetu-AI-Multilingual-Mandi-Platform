import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { SUPPORTED_LANGUAGES } from '@/shared/types';
import { User, MapPin, Phone, Mail, Globe, Edit, Save, X } from 'lucide-react';

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    preferredLanguage: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
}

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<ProfileForm>({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            preferredLanguage: user?.preferredLanguage || 'hi',
            city: user?.location?.city || '',
            state: user?.location?.state || '',
            latitude: user?.location?.coordinates?.[1] || 0,
            longitude: user?.location?.coordinates?.[0] || 0
        }
    });

    const onSubmit = async (data: ProfileForm) => {
        try {
            // In a real app, this would make an API call to update the user
            const updatedUser = {
                ...user!,
                name: data.name,
                email: data.email,
                phone: data.phone,
                preferredLanguage: data.preferredLanguage,
                location: {
                    city: data.city,
                    state: data.state,
                    coordinates: [data.longitude, data.latitude] as [number, number]
                }
            };

            updateUser(updatedUser);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
                    <p className="text-gray-600">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="h-12 w-12 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="mt-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'buyer'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role === 'buyer' ? 'Buyer' : 'Vendor'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center space-x-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{user.phone}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{user.location.city}, {user.location.state}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <Globe className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">
                                        {SUPPORTED_LANGUAGES[user.preferredLanguage as keyof typeof SUPPORTED_LANGUAGES]}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className={`text-sm ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.isVerified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-xs text-gray-500">
                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center space-x-2 text-green-600 hover:text-green-700"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span>Edit</span>
                                        </button>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                                            >
                                                <X className="h-4 w-4" />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            {...register('name', { required: 'Name is required' })}
                                            type="text"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^\S+@\S+$/i,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                            type="email"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            {...register('phone', {
                                                required: 'Phone number is required',
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: 'Please enter a valid 10-digit phone number'
                                                }
                                            })}
                                            type="tel"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Language
                                        </label>
                                        <select
                                            {...register('preferredLanguage', { required: 'Please select your preferred language' })}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        >
                                            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                                                <option key={code} value={code}>{name}</option>
                                            ))}
                                        </select>
                                        {errors.preferredLanguage && (
                                            <p className="mt-1 text-sm text-red-600">{errors.preferredLanguage.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            {...register('city', { required: 'City is required' })}
                                            type="text"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State
                                        </label>
                                        <input
                                            {...register('state', { required: 'State is required' })}
                                            type="text"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.state && (
                                            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            {...register('latitude', {
                                                required: 'Latitude is required',
                                                valueAsNumber: true,
                                                min: { value: -90, message: 'Invalid latitude' },
                                                max: { value: 90, message: 'Invalid latitude' }
                                            })}
                                            type="number"
                                            step="any"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.latitude && (
                                            <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            {...register('longitude', {
                                                required: 'Longitude is required',
                                                valueAsNumber: true,
                                                min: { value: -180, message: 'Invalid longitude' },
                                                max: { value: 180, message: 'Invalid longitude' }
                                            })}
                                            type="number"
                                            step="any"
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {errors.longitude && (
                                            <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!isDirty}
                                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>Save Changes</span>
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="mt-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                                    <p className="text-sm text-gray-600">Receive notifications about negotiations and deals</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                                    <p className="text-sm text-gray-600">Receive SMS updates for important activities</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                </div>
                                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                                    Enable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;