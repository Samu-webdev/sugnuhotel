<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color:#333;">
    <h2>Réservation modifiée — SugnuHotel</h2>
    <p>Bonjour {{ $reservation->user->name }},</p>
    <p>Votre réservation <strong>{{ $reservation->reservation_number }}</strong> a été mise à jour :</p>
    <ul>
        <li>Arrivée : {{ $reservation->check_in_date->format('d/m/Y') }}</li>
        <li>Départ : {{ $reservation->check_out_date->format('d/m/Y') }}</li>
        <li>Statut : {{ $reservation->status }}</li>
    </ul>
    <p><em>L'équipe SugnuHotel</em></p>
</body>
</html>
