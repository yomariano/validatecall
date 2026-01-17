import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-base sm:text-lg mb-6">Last updated: January 2026</p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              ValidateCall collects information you provide directly, including your name, email address,
              and payment information when you create an account or use our services.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to provide, maintain, and improve our AI-powered market
              research services, process transactions, and communicate with you about your account.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">3. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">4. Third-Party Services</h2>
            <p className="mb-4">
              We may use third-party services that collect, monitor, and analyze data to improve our
              service. These third parties have their own privacy policies.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">5. Your Rights</h2>
            <p className="mb-4">
              You have the right to access, correct, or delete your personal information. Contact us
              at support@validatecall.com for any privacy-related requests.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">6. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@validatecall.com" className="text-primary hover:underline">
                support@validatecall.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
