import User from '../models/User';
import Product from '../models/Product';
import Negotiation from '../models/Negotiation';

export const createMockData = async () => {
    try {
        // Clear existing data first for demo purposes
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Negotiation.deleteMany({});

        console.log('Creating fresh mock data...');

        // Create mock users
        const mockUsers = [
            {
                name: 'राम शर्मा',
                email: 'ram.sharma@example.com',
                password: 'password123',
                phone: '9876543210',
                role: 'vendor',
                preferredLanguage: 'hi',
                location: {
                    city: 'दिल्ली',
                    state: 'दिल्ली',
                    coordinates: [77.2090, 28.6139]
                },
                isVerified: true
            },
            {
                name: 'सुनीता देवी',
                email: 'sunita.devi@example.com',
                password: 'password123',
                phone: '9876543211',
                role: 'vendor',
                preferredLanguage: 'hi',
                location: {
                    city: 'मुंबई',
                    state: 'महाराष्ट्र',
                    coordinates: [72.8777, 19.0760]
                },
                isVerified: true
            },
            {
                name: 'अमित कुमार',
                email: 'amit.kumar@example.com',
                password: 'password123',
                phone: '9876543212',
                role: 'buyer',
                preferredLanguage: 'hi',
                location: {
                    city: 'दिल्ली',
                    state: 'दिल्ली',
                    coordinates: [77.2090, 28.6139]
                },
                isVerified: true
            },
            {
                name: 'प्रिया पटेल',
                email: 'priya.patel@example.com',
                password: 'password123',
                phone: '9876543213',
                role: 'buyer',
                preferredLanguage: 'gu',
                location: {
                    city: 'अहमदाबाद',
                    state: 'गुजरात',
                    coordinates: [72.5714, 23.0225]
                },
                isVerified: true
            },
            {
                name: 'राजेश वर्मा',
                email: 'rajesh.verma@example.com',
                password: 'password123',
                phone: '9876543214',
                role: 'vendor',
                preferredLanguage: 'hi',
                location: {
                    city: 'जयपुर',
                    state: 'राजस्थान',
                    coordinates: [75.7873, 26.9124]
                },
                isVerified: true
            }
        ];

        const createdUsers = [];
        for (const userData of mockUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }
        console.log(`Created ${createdUsers.length} mock users`);

        // Get vendor users for products
        const vendors = createdUsers.filter(user => user.role === 'vendor');

        // Create mock products
        const mockProducts = [
            {
                vendorId: vendors[0]._id,
                name: 'ताजे टमाटर',
                description: 'स्थानीय खेत से ताजे और जैविक टमाटर। बेहतरीन गुणवत्ता के साथ।',
                category: 'vegetables',
                basePrice: 40,
                currentPrice: 35,
                unit: 'kg',
                quantity: 100,
                images: ['https://images.unsplash.com/photo-1546470427-e5ac89c8ba3b?w=400'],
                location: {
                    city: 'दिल्ली',
                    state: 'दिल्ली',
                    coordinates: [77.2090, 28.6139]
                },
                isActive: true
            },
            {
                vendorId: vendors[0]._id,
                name: 'हरी मिर्च',
                description: 'तेज और ताजी हरी मिर्च। खाना बनाने के लिए परफेक्ट।',
                category: 'vegetables',
                basePrice: 80,
                currentPrice: 75,
                unit: 'kg',
                quantity: 50,
                images: ['https://images.unsplash.com/photo-1583663848850-46af132dc2ea?w=400'],
                location: {
                    city: 'दिल्ली',
                    state: 'दिल्ली',
                    coordinates: [77.2090, 28.6139]
                },
                isActive: true
            },
            {
                vendorId: vendors[1]._id,
                name: 'केले',
                description: 'मीठे और पके हुए केले। स्वास्थ्य के लिए बहुत अच्छे।',
                category: 'fruits',
                basePrice: 60,
                currentPrice: 55,
                unit: 'dozen',
                quantity: 200,
                images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'],
                location: {
                    city: 'मुंबई',
                    state: 'महाराष्ट्र',
                    coordinates: [72.8777, 19.0760]
                },
                isActive: true
            },
            {
                vendorId: vendors[1]._id,
                name: 'आम',
                description: 'अल्फांसो आम - राजा आम। बहुत मीठे और रसीले।',
                category: 'fruits',
                basePrice: 200,
                currentPrice: 180,
                unit: 'kg',
                quantity: 80,
                images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'],
                location: {
                    city: 'मुंबई',
                    state: 'महाराष्ट्र',
                    coordinates: [72.8777, 19.0760]
                },
                isActive: true
            },
            {
                vendorId: vendors[2]._id,
                name: 'बासमती चावल',
                description: 'प्रीमियम बासमती चावल। लंबे दाने और खुशबूदार।',
                category: 'grains',
                basePrice: 120,
                currentPrice: 110,
                unit: 'kg',
                quantity: 500,
                images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
                location: {
                    city: 'जयपुर',
                    state: 'राजस्थान',
                    coordinates: [75.7873, 26.9124]
                },
                isActive: true
            },
            {
                vendorId: vendors[2]._id,
                name: 'हल्दी पाउडर',
                description: 'शुद्ध हल्दी पाउडर। घर में बनी हुई, बिना मिलावट।',
                category: 'spices',
                basePrice: 300,
                currentPrice: 280,
                unit: 'kg',
                quantity: 30,
                images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400'],
                location: {
                    city: 'जयपुर',
                    state: 'राजस्थान',
                    coordinates: [75.7873, 26.9124]
                },
                isActive: true
            },
            {
                vendorId: vendors[0]._id,
                name: 'प्याज',
                description: 'ताजे प्याज। खाना बनाने के लिए जरूरी।',
                category: 'vegetables',
                basePrice: 30,
                currentPrice: 25,
                unit: 'kg',
                quantity: 150,
                images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
                location: {
                    city: 'दिल्ली',
                    state: 'दिल्ली',
                    coordinates: [77.2090, 28.6139]
                },
                isActive: true
            },
            {
                vendorId: vendors[1]._id,
                name: 'संतरे',
                description: 'रसीले और मीठे संतरे। विटामिन C से भरपूर।',
                category: 'fruits',
                basePrice: 80,
                currentPrice: 70,
                unit: 'kg',
                quantity: 120,
                images: ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400'],
                location: {
                    city: 'मुंबई',
                    state: 'महाराष्ट्र',
                    coordinates: [72.8777, 19.0760]
                },
                isActive: true
            }
        ];

        const createdProducts = await Product.insertMany(mockProducts);
        console.log(`Created ${createdProducts.length} mock products`);

        // Create some mock negotiations
        const buyers = createdUsers.filter(user => user.role === 'buyer');

        const mockNegotiations = [
            {
                productId: createdProducts[0]._id,
                buyerId: buyers[0]._id,
                vendorId: vendors[0]._id,
                status: 'active',
                currentOffer: {
                    price: 32,
                    quantity: 10,
                    proposedBy: buyers[0]._id
                },
                messages: [
                    {
                        senderId: buyers[0]._id,
                        message: 'क्या आप 10 किलो टमाटर के लिए 32 रुपये प्रति किलो लेंगे?',
                        offerPrice: 32,
                        offerQuantity: 10,
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
                    },
                    {
                        senderId: vendors[0]._id,
                        message: 'मैं 33 रुपये प्रति किलो दे सकता हूं। यह बहुत अच्छी गुणवत्ता है।',
                        offerPrice: 33,
                        offerQuantity: 10,
                        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
                    }
                ]
            },
            {
                productId: createdProducts[2]._id,
                buyerId: buyers[1]._id,
                vendorId: vendors[1]._id,
                status: 'completed',
                currentOffer: {
                    price: 50,
                    quantity: 5,
                    proposedBy: vendors[1]._id
                },
                finalPrice: 50,
                finalQuantity: 5,
                messages: [
                    {
                        senderId: buyers[1]._id,
                        message: '5 दर्जन केले चाहिए। क्या रेट है?',
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
                    },
                    {
                        senderId: vendors[1]._id,
                        message: '50 रुपये प्रति दर्जन। बहुत अच्छे केले हैं।',
                        offerPrice: 50,
                        offerQuantity: 5,
                        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000)
                    },
                    {
                        senderId: buyers[1]._id,
                        message: 'ठीक है, मंजूर है।',
                        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000)
                    }
                ]
            }
        ];

        const createdNegotiations = await Negotiation.insertMany(mockNegotiations);
        console.log(`Created ${createdNegotiations.length} mock negotiations`);

        console.log('Mock data created successfully!');
        console.log('Demo users:');
        console.log('Vendor: ram.sharma@example.com / password123');
        console.log('Buyer: amit.kumar@example.com / password123');

    } catch (error) {
        console.error('Error creating mock data:', error);
    }
};

export const clearMockData = async () => {
    try {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Negotiation.deleteMany({});
        console.log('Mock data cleared successfully!');
    } catch (error) {
        console.error('Error clearing mock data:', error);
    }
};