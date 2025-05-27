'use client';

import { useRouter } from 'next/navigation';
import ParticleBackground from './components/ParticleBackground';
import CustomButton from './components/buttons/CustomButton';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/dashboard');
    };

    return (
        <div className="bg-[var(--background)] text-[var(--text)] relative overflow-hidden">
            <ParticleBackground />
            <main className="container mx-auto py-24 relative z-10">
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
                        <img
                            src="/images/test.png"
                            alt="Money Tracker Illustration"
                            className="rounded-lg w-full h-auto"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;