<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color:#333;">
    <h2>Réservation annulée — SugnuHotel</h2>
    <p>Bonjour {{ $reservation->user->name }},</p>
    <p>Votre réservation <strong>{{ $reservation->reservation_number }}</strong> a bien été annulée.</p>
    <p>N'hésitez pas à réserver à nouveau quand vous le souhaitez.</p>
    <p><em>L'équipe SugnuHotel</em></p>
</body>
</html>
