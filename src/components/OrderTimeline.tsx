'use client';

import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';
import { Order } from '@/data/mockData';
import { buildOrderTimeline, hasTrackingInfo } from '@/lib/orderStatus';

function formatStepDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * The customer-facing progress of a made-to-order piece, from placement all
 * the way to the doorstep. Stages only fill in as the admin advances them.
 */
export default function OrderTimeline({ order }: { order: Order }) {
  if (order.order_status === 'cancelled') {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="font-serif text-base font-bold text-brand-rose">This order was cancelled.</p>
        <p className="text-xs text-brand-cocoa/70">
          Please reach out to Neeshiartique on WhatsApp if this looks wrong.
        </p>
      </div>
    );
  }

  const steps = buildOrderTimeline(order);

  return (
    <ol className="relative pl-8 space-y-7 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-[2px] before:bg-brand-beige">
      {steps.map((step) => (
        <li key={step.status} className="relative">
          {/* Node */}
          <span
            className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
              step.complete
                ? 'bg-brand-rose border-brand-rose text-brand-cream'
                : step.current
                ? 'bg-brand-cocoa border-brand-cocoa text-brand-cream shadow-md'
                : 'bg-brand-cream border-brand-beige text-brand-cocoa/35'
            }`}
          >
            {step.complete ? (
              <Check size={12} strokeWidth={3} />
            ) : step.current ? (
              <Clock size={12} strokeWidth={2.5} />
            ) : (
              <Circle size={8} strokeWidth={2.5} />
            )}
          </span>

          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h4
                className={`font-serif text-sm font-bold ${
                  step.current
                    ? 'text-brand-rose'
                    : step.complete
                    ? 'text-brand-cocoa'
                    : 'text-brand-cocoa/45'
                }`}
              >
                {step.label}
              </h4>
              {step.at && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cocoa/50">
                  {formatStepDate(step.at)}
                </span>
              )}
              {step.current && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-rose/10 text-brand-rose px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>

            <p
              className={`text-xs leading-relaxed ${
                step.complete || step.current ? 'text-brand-cocoa/80' : 'text-brand-cocoa/40'
              }`}
            >
              {step.description}
            </p>

            {/* Carrier details sit with the Shipped stage once they exist. */}
            {step.status === 'shipped' && hasTrackingInfo(order) && (
              <div className="mt-2 text-[11px] bg-brand-cream/70 border border-brand-beige rounded p-2.5 space-y-0.5 text-brand-cocoa/85">
                <p>
                  <span className="font-bold text-brand-cocoa">Carrier:</span> {order.carrier}
                </p>
                <p>
                  <span className="font-bold text-brand-cocoa">Tracking:</span>{' '}
                  <span className="font-mono">{order.tracking_number}</span>
                </p>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
