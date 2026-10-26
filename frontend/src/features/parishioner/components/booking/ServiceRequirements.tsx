import BookingCard from "./BookingCard";

type ServiceCode =
  "baptism" | "wedding" | "funeral" | "confirmation" | "first-communion";
type Requirement = { title: string; english: string; tagalog: string };
type Guide = {
  name: string;
  tagalogName: string;
  documents: Requirement[];
  notes: Requirement[];
};

const guides: Record<ServiceCode, Guide> = {
  baptism: {
    name: "Baptism",
    tagalogName: "Binyag",
    documents: [
      {
        title: "Birth Certificate",
        english: "Birth certificate of the person to be baptized.",
        tagalog: "Sertipiko ng kapanganakan ng bibinyagan.",
      },
      {
        title: "Godparent Certificates",
        english:
          "For each godparent: Marriage Contract if married in the Church, or Confirmation Certificate otherwise. Select the certificate type with the godparent's details.",
        tagalog:
          "Para sa bawat ninong o ninang: Marriage Contract kung kasal sa Simbahan, o sertipiko ng Kumpil kung hindi. Piliin ang uri ng sertipiko sa detalye ng ninong o ninang.",
      },
      {
        title: "Certificate of No Record of Baptism — Ages 7 and Above",
        english:
          "Required when the person to be baptized is 7 years old or older.",
        tagalog:
          "Kailangan ang sertipikong walang tala ng Binyag kung 7 taong gulang pataas ang bibinyagan.",
      },
    ],
    notes: [
      {
        title: "Baptism Permit — If Applicable",
        english:
          "If you are outside this parish's jurisdiction, obtain a Baptism Permit from your parish of origin and coordinate with the parish office.",
        tagalog:
          "Kung hindi sakop ng parokyang ito, kumuha ng pahintulot sa Binyag mula sa inyong pinanggalingang parokya at makipag-ugnayan sa opisina.",
      },
      {
        title: "Seminar",
        english:
          "For ages 0–11, the seminar is half a day; for ages 12 and above, it lasts two full days. Parents and godparents must attend. Parish staff will arrange the seminar schedule and send it by SMS.",
        tagalog:
          "Para sa edad 0–11, kalahating araw ang seminar; para sa edad 12 pataas, dalawang buong araw. Kailangang dumalo ang mga magulang at ninong o ninang. Itatakda ng parokya ang iskedyul at ipapadala ito sa SMS.",
      },
    ],
  },
  wedding: {
    name: "Wedding",
    tagalogName: "Kasal",
    documents: [
      {
        title: "Marriage License & CENOMAR",
        english:
          "Prepare the Marriage License from the Civil Registrar and Certificate of No Marriage (CENOMAR).",
        tagalog:
          "Ihanda ang Marriage License mula sa Civil Registrar at Certificate of No Marriage o CENOMAR.",
      },
      {
        title: "Baptismal & Confirmation Certificates",
        english:
          "For each applicant, attach the certificate for a sacrament already received (Yes). If the answer is No, complete the linked preparation service instead; its certificate is not required as a separate wedding attachment.",
        tagalog:
          "Para sa bawat aplikante, ilakip ang sertipiko ng sakramentong natanggap na (Yes). Kung No, kumpletuhin ang kaugnay na serbisyo; hindi kailangang ilakip nang hiwalay sa wedding booking ang sertipikong manggagaling dito.",
      },
      {
        title: "Three 3R Couple Photos",
        english:
          "Prepare three portrait-oriented 3R photos showing both applicants. Indicate your names, wedding address, date, day, and time.",
        tagalog:
          "Maghanda ng tatlong 3R na larawang patayo at magkasama ang nobya at nobyo. Ilagay ang mga pangalan, lugar, petsa, araw, at oras ng kasal.",
      },
      {
        title: "Principal Sponsor Certificates",
        english:
          "For each principal sponsor: Marriage Contract if married in the Church, or Confirmation Certificate otherwise. Select the certificate type with the sponsor's details.",
        tagalog:
          "Para sa bawat pangunahing ninong o ninang: Marriage Contract kung kasal sa Simbahan, o sertipiko ng Kumpil kung hindi. Piliin ang uri ng sertipiko sa detalye ng sponsor.",
      },
    ],
    notes: [
      {
        title: "Age & Priest Interview",
        english:
          "Both applicants must be at least 18. Applicants aged 18–24 must attend a priest interview with their parents. Staff will arrange the interview and notify you by SMS.",
        tagalog:
          "Dapat 18 taong gulang pataas ang nobya at nobyo. Ang may edad 18–24 ay kailangang dumalo sa panayam sa pari kasama ang kanilang mga magulang. Itatakda ito ng parokya at ipapaalam sa SMS.",
      },
      {
        title: "Not Yet Baptized or Confirmed",
        english:
          "Answer separately for each applicant. A No answer requires the corresponding Baptism or Confirmation forms; complete both if neither sacrament has been received. These services have separate fees and priest-coordinated schedules. Upload each service's requirements only after its own schedule is confirmed. Certificates obtained through these linked services do not need to be attached again to the wedding booking.",
        tagalog:
          "Sagutin nang hiwalay para sa nobya at nobyo. Kung No, kumpletuhin ang form para sa Binyag o Kumpil; pareho kung wala pa ang dalawang sakramento. May magkahiwalay na bayad at iskedyul ayon sa pari. Mag-upload lamang kapag kumpirmado na ang iskedyul ng kaukulang serbisyo. Hindi na kailangang ilakip muli sa wedding booking ang sertipikong manggagaling sa mga serbisyong ito.",
      },
      {
        title: "Permission of Parish & Publication of Banns — If Applicable",
        english:
          "Applicants from another parish should coordinate these requirements with the parish office after the interview or canonical investigation.",
        tagalog:
          "Kung mula sa ibang parokya, makipag-ugnayan sa opisina tungkol sa pahintulot at pagpapahayag ng kasal pagkatapos ng panayam o canonical investigation.",
      },
      {
        title: "Confession",
        english:
          "Both applicants are encouraged to receive the Sacrament of Reconciliation before the wedding.",
        tagalog:
          "Hinihikayat ang nobya at nobyo na magkumpisal bago ang kasal.",
      },
    ],
  },
  funeral: {
    name: "Funeral",
    tagalogName: "Misa sa Patay",
    documents: [
      {
        title: "Death Certificate",
        english: "Prepare the deceased person's death certificate.",
        tagalog: "Ihanda ang sertipiko ng pagkamatay ng yumao.",
      },
      {
        title: "Memorial Biography",
        english:
          "Prepare a written life story honoring the deceased. This is a required document, separate from the personal information in the booking form.",
        tagalog:
          "Maghanda ng nakasulat na talambuhay bilang paggunita sa yumao. Kailangan itong dokumento, bukod sa personal na impormasyong nasa booking form.",
      },
    ],
    notes: [
      {
        title: "Information to Prepare",
        english:
          "Complete the deceased's personal and family details, sacramental information, church life and characteristics, and the informant's details. The requested funeral date and time remain subject to admin confirmation.",
        tagalog:
          "Kumpletuhin ang personal at pampamilyang detalye ng yumao, mga sakramento, pakikilahok sa simbahan at mga katangian, at detalye ng nagbibigay ng impormasyon. Kailangan pa ring kumpirmahin ng admin ang hiniling na petsa at oras ng misa.",
      },
    ],
  },
  confirmation: {
    name: "Confirmation",
    tagalogName: "Kumpil",
    documents: [
      {
        title: "Baptismal Certificate",
        english:
          "Prepare the candidate's Baptismal Certificate for sacramental purposes.",
        tagalog:
          "Ihanda ang sertipiko ng Binyag ng kukumpilan para sa pagtanggap ng sakramento.",
      },
      {
        title: "Sponsor Certificates",
        english:
          "Provide at least one sponsor's name, address, and details. For each sponsor, select Marriage Contract if married in the Church, or Confirmation Certificate otherwise; upload the selected certificate after schedule confirmation.",
        tagalog:
          "Ibigay ang pangalan, tirahan, at detalye ng hindi bababa sa isang ninong o ninang. Para sa bawat sponsor, piliin ang Marriage Contract kung kasal sa Simbahan, o sertipiko ng Kumpil kung hindi. I-upload ito kapag kumpirmado na ang iskedyul.",
      },
    ],
    notes: [
      {
        title: "Candidate & Parent Details",
        english:
          "Prepare the candidate's personal details, parish of origin, baptism date and church, and both parents' information.",
        tagalog:
          "Ihanda ang personal na detalye, pinanggalingang parokya, petsa at simbahan ng Binyag ng kukumpilan, at impormasyon ng parehong magulang.",
      },
      {
        title: "Seminar",
        english:
          "Attend the required parish seminar. Staff will assign its date and time and notify the account holder by SMS. The seminar must be scheduled before final booking approval.",
        tagalog:
          "Dumalo sa kinakailangang seminar ng parokya. Itatakda ng staff ang petsa at oras at ipapaalam sa may-ari ng account sa SMS. Kailangang maitakda ang seminar bago ang pinal na pag-apruba ng booking.",
      },
    ],
  },
  "first-communion": {
    name: "First Communion",
    tagalogName: "Unang Komunyon",
    documents: [
      {
        title: "Baptismal Certificate",
        english:
          "Prepare the participant's Baptismal Certificate for sacramental purposes. Sponsor certificates are not required for this service.",
        tagalog:
          "Ihanda ang sertipiko ng Binyag ng tatanggap ng Unang Komunyon. Hindi kailangan ng sertipiko ng ninong o ninang para sa serbisyong ito.",
      },
    ],
    notes: [
      {
        title: "Free Service / Walang Bayad",
        english:
          "First Communion is free. No payment is required. Please still complete the required documents and parish seminar.",
        tagalog:
          "Walang bayad ang Unang Komunyon. Hindi kailangang magbayad. Kailangan pa ring kumpletuhin ang mga dokumento at seminar ng parokya.",
      },
      {
        title: "Participant & Parent Details",
        english:
          "Prepare the participant's personal details, parish of origin, baptism date and church, and both parents' information.",
        tagalog:
          "Ihanda ang personal na detalye, pinanggalingang parokya, petsa at simbahan ng Binyag ng tatanggap, at impormasyon ng parehong magulang.",
      },
      {
        title: "Seminar",
        english:
          "Attend the required parish seminar. Staff will assign its date and time and notify the account holder by SMS. The seminar must be scheduled before final booking approval.",
        tagalog:
          "Dumalo sa kinakailangang seminar ng parokya. Itatakda ng staff ang petsa at oras at ipapaalam sa may-ari ng account sa SMS. Kailangang maitakda ang seminar bago ang pinal na pag-apruba ng booking.",
      },
    ],
  },
};

export default function ServiceRequirements({
  service,
}: {
  service: ServiceCode;
}) {
  const guide = guides[service];
  return (
    <BookingCard title={`${guide.name} Requirements`}>
      <div className="space-y-6">
        <div>
          <p className="text-gray-700">
            Review the {guide.name.toLowerCase()} requirements before completing
            your booking. Documents are submitted later through My Profile.
          </p>
          <p lang="tl" className="mt-1 text-sm text-gray-500">
            Basahin ang mga kailangan para sa {guide.tagalogName} bago
            kumpletuhin ang booking. Isusumite ang mga dokumento sa My Profile
            sa susunod na yugto.
          </p>
        </div>
        <section className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-800">
            Important Reminder{" "}
            <span lang="tl" className="block text-sm font-normal">
              Mahalagang Paalala
            </span>
          </h3>
          <p className="mt-2 text-sm text-yellow-800">
            {service === "first-communion"
              ? "Complete the First Communion registration form. The parish will assign the ceremony date and notify you by SMS."
              : `Complete the ${guide.name.toLowerCase()} form and submit your requested schedule for admin review.`}{" "}
            Wait for the confirmation SMS before uploading any requirements,
            including sponsor documents where applicable. Bring physical copies
            only after digital approval.{" "}
            {service === "first-communion"
              ? "First Communion is free; required documents and physical copies must still be submitted."
              : "You can select a payment method once the parish confirms your schedule."}{" "}
            Schedule confirmation is not final booking approval.
          </p>
          <p
            lang="tl"
            className="mt-3 border-t border-yellow-200 pt-3 text-sm text-yellow-800"
          >
            {service === "first-communion"
              ? "Kumpletuhin ang form para sa Unang Komunyon. Ang parokya ang magtatakda ng petsa at magpapadala ng SMS."
              : `Kumpletuhin ang form para sa ${guide.tagalogName} at isumite ang hiniling na iskedyul para masuri ng admin.`}{" "}
            Hintayin ang kumpirmasyon sa SMS bago mag-upload ng anumang
            requirements, kasama ang dokumento ng sponsor kung kailangan. Dalhin
            lamang ang mga pisikal na kopya kapag naaprubahan na ang mga digital
            na dokumento.{" "}
            {service === "first-communion"
              ? "Walang bayad ang Unang Komunyon, ngunit kailangan pa rin ang mga dokumento at pisikal na kopya."
              : "Maaari nang pumili ng paraan ng pagbabayad kapag nakumpirma na ng parokya ang inyong iskedyul."}{" "}
            Ang kumpirmasyon ng iskedyul ay hindi pa pinal na pag-apruba ng
            booking.
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold text-[#B22222]">
            Documents to Prepare{" "}
            <span lang="tl" className="block text-sm font-normal text-gray-500">
              Mga Dokumentong Ihahanda
            </span>
          </h3>
          {guide.documents.map((item) => (
            <RequirementCard key={item.title} item={item} />
          ))}
        </section>
        <section className="space-y-3 border-t border-gray-200 pt-5">
          <h3 className="font-semibold text-[#B22222]">
            Service Guidelines{" "}
            <span lang="tl" className="block text-sm font-normal text-gray-500">
              Mga Gabay sa Serbisyo
            </span>
          </h3>
          {guide.notes.map((item) => (
            <RequirementCard key={item.title} item={item} />
          ))}
        </section>
      </div>
    </BookingCard>
  );
}

function RequirementCard({ item }: { item: Requirement }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h4 className="font-semibold text-[#B22222]">{item.title}</h4>
      <p className="mt-2 text-sm text-gray-700">{item.english}</p>
      <p lang="tl" className="mt-1 text-sm text-gray-500">
        {item.tagalog}
      </p>
    </div>
  );
}
