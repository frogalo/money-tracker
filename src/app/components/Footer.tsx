const Footer = () => {
    return (
        <footer className="bg-[var(--background)] text-[var(--text)] py-4 mt-8">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Money Tracker. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;