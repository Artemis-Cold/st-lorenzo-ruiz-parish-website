# Booking schedule review

Run `php artisan migrate` from `backend` when deploying this change. Deploy the frontend and backend together.

## Parishioner workflow

1. Open Baptism, Wedding, Funeral, Confirmation, or First Communion. Review Requirements first, then select Schedule, choose the package, complete personal/sponsor forms, and review the booking. There is no document-upload step. Sponsor certificate types are selected with sponsor details; files are submitted later. Selecting a schedule alone does not reserve it.
2. Submit the completed form. Details and the schedule request are saved together; the slot is held transactionally, subject to admin approval. Document uploads remain locked.
3. After confirmation, the SMS directs the parishioner to **My Profile → View booking** to upload requirements. Existing unfinished schedule-only requests can still complete their forms.
4. If rejected, view the reason in My Profile or the SMS and choose another schedule. The same booking keeps its package, personal details, and sponsors; no repeat form entry is required.

## Staff workflow

Open **Booking Management → View booking**. Use **Confirm Schedule & Notify** or **Reject Schedule**. Rejection requires a reason and sends it by SMS. Schedule confirmation is separate from final booking approval, document approval, and payment.

For wedding preparation Baptism/Confirmation bookings, assign the **Sacrament** ceremony date and time using **Save Schedule & Notify**. This staff action confirms that ceremony and sends the message allowing requirement submission. Its files cannot be uploaded with the parent wedding request.

## Reservation and existing records

- A pending schedule request holds its slot until rejection, cancellation where permitted, or rescheduling. No automatic expiry was introduced.
- The existing transaction/slot locks protect shared service times; Baptism retains group sessions.
- Rejection releases the requested time. Rescheduling requires admin confirmation again and locks further uploads/payment until confirmed. Existing files remain stored.
- The migration sends existing pending/paid sacrament bookings to schedule review while preserving their submitted details, files, and payments. Already approved/completed bookings retain confirmed schedules.
- Mass intentions and document requests retain their existing workflows.
- SMS uses the existing configured SMS driver and queue. Run the normal queue worker when using an asynchronous queue; a database/log driver does not deliver a real text message.

The automated feature checks use a test database and fake/logged SMS. They do not send real messages or load-test concurrent requests on the production database.
