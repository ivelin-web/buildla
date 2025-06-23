import { Card, CardContent } from '@/components/ui/card';
import { getAssistants } from '@/lib/actions/assistants';
import { getOffersData } from '@/lib/offers';

export default async function DashboardOverview() {
  const assistants = await getAssistants();
  const offers = getOffersData();

  const stats = {
    totalAssistants: assistants.length,
    totalOffers: offers.length,
    completedOffers: offers.filter(o => o.status === 'completed').length,
    totalRevenue: offers.reduce((sum, offer) => sum + offer.offerDetails.totalIncVat, 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAssistants}</div>
          <p className="text-gray-600 text-sm">Active Assistants</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-green-600">{stats.totalOffers}</div>
          <p className="text-gray-600 text-sm">Total Offers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-purple-600">{stats.completedOffers}</div>
          <p className="text-gray-600 text-sm">Completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-orange-600">
            {stats.totalRevenue.toLocaleString('sv-SE')} kr
          </div>
          <p className="text-gray-600 text-sm">Total Revenue</p>
        </CardContent>
      </Card>
    </div>
  );
} 