<?php

declare(strict_types=1);

/*
 * This file is part of SolidInvoice project.
 *
 * (c) 2013-2017 Pierre du Plessis <info@customscripts.co.za>
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace SolidInvoice\MoneyBundle;

use Money\Money;
use SolidInvoice\CoreBundle\Entity\Discount;
use SolidInvoice\InvoiceBundle\Entity\Invoice;
use SolidInvoice\MoneyBundle\Formatter\MoneyFormatter;
use SolidInvoice\QuoteBundle\Entity\Quote;

final class Calculator
{
    public function calculateDiscount($entity): Money
    {
        if (!$entity instanceof Quote && !$entity instanceof Invoice) {
            throw new \InvalidArgumentException(sprintf('"%s" expects instance of Quote or Invoice, "%s" given.', __METHOD__, \is_object($entity) ? \get_class($entity) : \gettype($entity)));
        }

        $discount = $entity->getDiscount();

        $invoiceTotal = $entity->getBaseTotal()->add($entity->getTax());

        if (Discount::TYPE_PERCENTAGE === $discount->getType()) {
            return new Money($this->calculatePercentage($invoiceTotal, $discount->getValue()), $invoiceTotal->getCurrency());
        }

        return $discount->getValue();
    }

    public function calculatePercentage($amount, float $percentage = 0.0): float
    {
        if ($percentage < 0) {
            $percentage *= 100;
        }

        if ($amount instanceof Money) {
            return MoneyFormatter::toFloat($amount->multiply($percentage));
        }

        return ($amount * $percentage) / 100;
    }
}
