<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color:#333;">
    <h2>Réservation confirmée — SugnuHotel</h2>
    <p>Bonjour {{ $reservation->user->name }},</p>
    <p>Votre réservation a bien été enregistrée. Voici le récapitulatif :</p>
    <table cellpadding="6" style="border-collapse: collapse; width:100%;">
        <tr><td><strong>Numéro</strong></td><td>{{ $reservation->reservation_number }}</td></tr>
        <tr><td><strong>Chambre</strong></td><td>{{ $reservation->room->roomType->name }} n°{{ $reservation->room->room_number }}</td></tr>
        <tr><td><strong>Arrivée</strong></td><td>{{ $reservation->check_in_date->format('d/m/Y') }}</td></tr>
        <tr><td><strong>Départ</strong></td><td>{{ $reservation->check_out_date->format('d/m/Y') }}</td></tr>
        <tr><td><strong>Total</strong></td><td>{{ number_format($reservation->total_price, 0, ',', ' ') }} FCFA</td></tr>
    </table>
    <p>Merci de votre confiance, à bientôt !</p>
    <p><em>L'équipe SugnuHotel</em></p>
</body>
</html>
