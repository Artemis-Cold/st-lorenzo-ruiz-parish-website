import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/alert-dialog";

interface TermsAndConditionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  {
    title: "1. Account information",
    content:
      "You agree to provide accurate and current information, keep your account secure, and use a mobile number that belongs to you or that you are authorized to use.",
  },
  {
    title: "2. Parish service requests",
    content:
      "Submitting a booking or document request does not guarantee approval. Requests remain subject to schedule availability, complete requirements, payment verification when applicable, and review by parish staff.",
  },
  {
    title: "3. Documents and payments",
    content:
      "You agree to submit authentic and readable requirements and accurate payment information. Invalid, incomplete, altered, or unverifiable submissions may be rejected or returned for resubmission.",
  },
  {
    title: "4. SMS notifications",
    content:
      "You consent to receive service-related SMS messages, including verification codes, requirement reminders, schedule notices, payment updates, and document status notifications. These are transactional messages and are not intended for marketing.",
  },
  {
    title: "5. Compliance with the Data Privacy Act",
    content:
      "St. Lorenzo Ruiz Parish is committed to processing personal and sensitive personal information in accordance with Republic Act No. 10173, also known as the Data Privacy Act of 2012, its Implementing Rules and Regulations, and applicable National Privacy Commission issuances. Personal data will be processed transparently, for legitimate purposes, and only to the extent necessary for parish services.",
  },
  {
    title: "6. Collection, use, and protection of personal data",
    content:
      "Information you provide—including identity and contact details, uploaded documents and photos, booking or request information, and payment proof—may be used for account administration, identity and phone verification, parish records, service coordination, payment validation, notifications, security, and applicable legal obligations. The parish will apply reasonable safeguards, limit access to authorized personnel and necessary service providers, and retain information only for as long as reasonably necessary or required by law.",
  },
  {
    title: "7. Your data privacy rights",
    content:
      "Subject to applicable law, you may ask to be informed about the processing of your personal data, request access or correction, object to or withdraw consent where consent is the lawful basis, and request blocking or deletion when legally permitted. For privacy questions or to exercise these rights, contact the St. Lorenzo Ruiz Parish office.",
  },
  {
    title: "8. Responsible use",
    content:
      "You must not impersonate another person, submit fraudulent information, disrupt the service, attempt unauthorized access, or use the system for unlawful purposes.",
  },
  {
    title: "9. Changes and assistance",
    content:
      "The parish may revise these terms when service procedures or legal requirements change. For questions, corrections, or assistance, contact the St. Lorenzo Ruiz Parish office.",
  },
];

export default function TermsAndConditionsDialog({
  open,
  onOpenChange,
}: TermsAndConditionsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <AlertDialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left sm:px-8">
          <AlertDialogTitle className="font-serif text-2xl font-bold text-[#292524]">
            Terms and Conditions
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-sm text-gray-500">
            St. Lorenzo Ruiz Parish Online Services · Data Privacy Act
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div
          data-modal-scroll="true"
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm leading-6 text-gray-600 sm:px-8"
        >
          <p>
            By creating an account, you confirm that you have read, understood,
            and agreed to the following conditions for using the parish online
            services.
          </p>

          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <p className="mt-1">{section.content}</p>
            </section>
          ))}
        </div>

        <AlertDialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
          <AlertDialogAction className="bg-[#B22222] text-white hover:bg-[#981B1B]">
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
