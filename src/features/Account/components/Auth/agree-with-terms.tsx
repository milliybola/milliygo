import { Typography } from 'antd'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

function AgreeWithTerms(): React.ReactElement {
  const t = useTranslations()

  return (
    <div className="mb-3">
      <Typography className="text-center">
        <Typography.Text className="!text-sm text-primary-dark">
          {t.rich('auth.login-terms', {
            link1: (chunks) => (
              <Link href="/terms-of-use" aria-label={`open support route`}>
                <Typography.Text className="!text-sm text-primary" underline>
                  {chunks}
                </Typography.Text>
              </Link>
            ),
            link2: (chunks) => (
              <Link href="/privacy" aria-label={`open pravila2 route`}>
                <Typography.Text className="!text-sm text-primary" underline>
                  {chunks}
                </Typography.Text>
              </Link>
            ),
          })}
        </Typography.Text>
      </Typography>
    </div>
  )
}

export default AgreeWithTerms
