import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOffers } from '@/lib/actions/offers';

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Offers</CardTitle>
        <CardDescription>
          Review and manage offers generated by your AI assistants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {offers.slice(0, 10).map((offer) => (
            <div
              key={offer.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {offer.customer_info.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{offer.customer_info.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {offer.offer_details.totalIncVat.toLocaleString('sv-SE')} kr
                  </div>
                  <div className="text-gray-500 text-xs">
                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString('sv-SE') : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                <div>Area: {offer.offer_details.area}m²</div>
                <div>Labor: {offer.offer_details.laborCost.toLocaleString('sv-SE')} kr</div>
                <div>Material: {offer.offer_details.materialCost.toLocaleString('sv-SE')} kr</div>
                <div>ROT: -{offer.offer_details.rotDeduction.toLocaleString('sv-SE')} kr</div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  {offer.offer_details.form === 'standard' ? 'Standard form' : 'Annan form'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  {offer.offer_details.builtBefore1950 ? 'Före 1950' : 'Modern fastighet'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  {offer.offer_details.tileType === 'standard' ? 'Standard kakel' : 'Icke-standard kakel'}
                </span>
                {offer.offer_details.builtInDetails > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {offer.offer_details.builtInDetails} inbyggda detaljer
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {offers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No offers generated yet. Start using your AI assistants to see offers here.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 