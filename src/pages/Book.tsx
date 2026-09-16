import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { Seo, breadcrumbSchema } from '@/lib/seo';
import { CONTACT } from '@/data/site';
import { useBooking } from '@/lib/booking';

export default function Book() {
  const { step } = useBooking();

  return (
    <>
      <Seo
        title="Book a Shoot"
        description={`Book real estate photography, video or drone coverage in ${CONTACT.serviceArea}. Choose a package, pick a time that is genuinely available, and see the total before you pay.`}
        path="/book"
        // The confirmation is a private receipt, not a page to be indexed.
        noIndex={step === 'confirmed'}
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Book', path: '/book' },
        ])}
      />

      <PageHeader
        label="Booking"
        title={['Check availability', 'and book.']}
        lead="Nine short steps. The price builds as you go, the calendar only offers times that are genuinely free, and you can go back and change anything before paying."
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Book', path: '/book' },
        ]}
        compact
      />

      <div className="pt-12 sm:pt-16">
        <BookingFlow />
      </div>

      <Footer />
    </>
  );
}
