'use client';

import {useRouter} from 'next/navigation';
import ParticleBackground from './components/ParticleBackground';
import CustomButton from './components/buttons/CustomButton';
import {ArrowRight} from 'lucide-react';
import Image from 'next/image';
import TestImage from '../../public/images/test.png';
import {useSession} from 'next-auth/react';

const HomePage = () => {
    const router = useRouter();
    const {data: session} = useSession();

    const handleGetStarted = () => {
        if (session?.user?.id) {
            router.push(`/(user)/dashboard/${session.user.id}`);
        } else {
            console.warn('User ID not found. Redirecting to default page.');
            router.push('/');
        }
    };

    return (
        <div className="relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full z-10">
                <ParticleBackground/>
            </div>
            <div className="relative bg-[var(--background)] text-[var(--text)]">
                <main className="container mx-auto py-24 relative z-30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="md:order-2">
                            <h1 className="text-4xl font-bold mb-4">
                                Welcome to <span className="text-[var(--green)]">Money</span> Tracker
                            </h1>
                            <p className="text-lg mb-6">
                                Take control of your finances with our intuitive money tracking
                                application. Monitor your expenses, set budgets, and achieve
                                your financial goals.
                            </p>
                            <CustomButton
                                text="Get Started"
                                icon={ArrowRight}
                                onClick={handleGetStarted}
                            />
                        </div>
                        <div className="md:order-1">
                            <Image
                                src={TestImage}
                                alt="Money Tracker Illustration"
                                className="rounded-lg"
                                width={500}
                                height={300}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;