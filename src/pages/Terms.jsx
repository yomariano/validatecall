import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-base sm:text-lg mb-6">Last updated: January 2026</p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using ValidateCall's services, you agree to be bound by these Terms of Service
              and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">2. Description of Service</h2>
            <p className="mb-4">
              ValidateCall provides AI-powered market research and lead generation services through
              intelligent voice conversations. Our platform helps businesses validate ideas and gather
              market insights.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">3. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and
              for all activities that occur under your account. You must notify us immediately of any
              unauthorized use.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">4. Acceptable Use</h2>
            <p className="mb-4">
              You agree not to use our services for any unlawful purpose or in any way that could damage,
              disable, or impair our services. Automated calls must comply with all applicable laws and
              regulations.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">5. Payment Terms</h2>
            <p className="mb-4">
              Paid services are billed in advance. All fees are non-refundable except as required by law
              or as explicitly stated in our refund policy. We reserve the right to change our pricing
              with reasonable notice.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              ValidateCall shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of our services.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">7. Contact</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us at{" "}
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

export default Terms;
