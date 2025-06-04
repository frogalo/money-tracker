import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import User from '@/app/models/User';
import dbConnect from '@/app/lib/mongodb';

// Define types for settings
interface NotificationSettings {
    push?: boolean;
    email?: boolean;
    budgetAlerts?: boolean;
}

interface BudgetSettings {
    monthlyLimit?: number;
}

interface PrivacySettings {
    dataRetention?: '6months' | '1year' | '2years' | 'forever';
}

interface UserSettingsUpdate {
    defaultCurrency?: 'PLN' | 'USD' | 'EUR' | 'GBP';
    preferredDateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    customName?: string;
    preferredTheme?: 'light' | 'dark';
    language?: 'en' | 'pl' | 'es' | 'fr';
    notifications?: NotificationSettings;
    budget?: BudgetSettings;
    privacy?: PrivacySettings;
}

// GET - Retrieve user settings
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Await params before using
        const { userId } = await params;
        // console.log('GET request for userId:', userId); // Debug log

        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is accessing their own settings
        if (session.user.id !== userId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only access your own settings' },
                { status: 403 }
            );
        }

        await dbConnect();

        const user = await User.findById(userId).select('settings');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return settings with defaults if not set
        const settings = {
            defaultCurrency: user.settings?.defaultCurrency || 'PLN',
            preferredDateFormat:
                user.settings?.preferredDateFormat || 'DD/MM/YYYY',
            customName: user.settings?.customName || '',
            preferredTheme: user.settings?.preferredTheme || 'light',
            language: user.settings?.language || 'en',
            notifications: {
                push: user.settings?.notifications?.push ?? true,
                email: user.settings?.notifications?.email ?? false,
                budgetAlerts: user.settings?.notifications?.budgetAlerts ?? true,
            },
            budget: {
                monthlyLimit: user.settings?.budget?.monthlyLimit || 0,
            },
            privacy: {
                dataRetention: user.settings?.privacy?.dataRetention || '1year',
            },
        };

        return NextResponse.json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Update user settings
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Await params before using
        const { userId } = await params;
        // console.log('POST request for userId:', userId); // Debug log

        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is updating their own settings
        if (session.user.id !== userId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only update your own settings' },
                { status: 403 }
            );
        }

        const body: UserSettingsUpdate = await request.json();

        // Validate the request body
        const allowedFields: (keyof UserSettingsUpdate)[] = [
            'defaultCurrency',
            'preferredDateFormat',
            'customName',
            'preferredTheme',
            'language',
            'notifications',
            'budget',
            'privacy',
        ];

        const updateData: Record<string, unknown> = {};

        // Validate and build update object
        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key as keyof UserSettingsUpdate)) {
                if (key === 'defaultCurrency') {
                    const currency = value as string;
                    if (!['PLN', 'USD', 'EUR', 'GBP'].includes(currency)) {
                        return NextResponse.json(
                            { error: 'Invalid currency' },
                            { status: 400 }
                        );
                    }
                    updateData[`settings.${key}`] = currency;
                } else if (key === 'preferredDateFormat') {
                    const dateFormat = value as string;
                    if (
                        !['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(dateFormat)
                    ) {
                        return NextResponse.json(
                            { error: 'Invalid date format' },
                            { status: 400 }
                        );
                    }
                    updateData[`settings.${key}`] = dateFormat;
                } else if (key === 'preferredTheme') {
                    const theme = value as string;
                    if (!['light', 'dark'].includes(theme)) {
                        return NextResponse.json(
                            { error: 'Invalid theme' },
                            { status: 400 }
                        );
                    }
                    updateData[`settings.${key}`] = theme;
                } else if (key === 'language') {
                    const language = value as string;
                    if (!['en', 'pl', 'es', 'fr'].includes(language)) {
                        return NextResponse.json(
                            { error: 'Invalid language' },
                            { status: 400 }
                        );
                    }
                    updateData[`settings.${key}`] = language;
                } else if (key === 'customName') {
                    const customName = value as string;
                    if (customName.length <= 100) {
                        updateData[`settings.${key}`] = customName;
                    } else {
                        return NextResponse.json(
                            {
                                error:
                                    'Custom name must be a string with max 100 characters',
                            },
                            { status: 400 }
                        );
                    }
                } else if (key === 'notifications') {
                    const notifications = value as NotificationSettings;
                    if (typeof notifications === 'object' && notifications !== null) {
                        if (typeof notifications.push === 'boolean') {
                            updateData['settings.notifications.push'] = notifications.push;
                        }
                        if (typeof notifications.email === 'boolean') {
                            updateData['settings.notifications.email'] =
                                notifications.email;
                        }
                        if (typeof notifications.budgetAlerts === 'boolean') {
                            updateData['settings.notifications.budgetAlerts'] =
                                notifications.budgetAlerts;
                        }
                    }
                } else if (key === 'budget') {
                    const budget = value as BudgetSettings;
                    if (typeof budget === 'object' && budget !== null) {
                        if (
                            typeof budget.monthlyLimit === 'number' &&
                            budget.monthlyLimit >= 0
                        ) {
                            updateData['settings.budget.monthlyLimit'] =
                                budget.monthlyLimit;
                        } else if (budget.monthlyLimit !== undefined) {
                            return NextResponse.json(
                                { error: 'Monthly limit must be a positive number' },
                                { status: 400 }
                            );
                        }
                    }
                } else if (key === 'privacy') {
                    const privacy = value as PrivacySettings;
                    if (typeof privacy === 'object' && privacy !== null) {
                        if (
                            privacy.dataRetention &&
                            ['6months', '1year', '2years', 'forever'].includes(
                                privacy.dataRetention
                            )
                        ) {
                            updateData['settings.privacy.dataRetention'] =
                                privacy.dataRetention;
                        }
                    }
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('settings');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            settings: updatedUser.settings,
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Alternative update method (same as POST for this use case)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    return POST(request, { params });
}