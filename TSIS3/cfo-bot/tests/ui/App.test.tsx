import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('UI calculation consistency (SSOT)', () => {
  it('shows default total for modelA and manual egress', async () => {
    render(<App />)
    const total = screen.getByTestId('total-monthly-cost')
    expect(total).toHaveTextContent('$507.92')
  })

  it('updates total when model changes (modelB)', async () => {
    render(<App />)
    const user = userEvent.setup()
    const total = screen.getByTestId('total-monthly-cost')

    const modelSelect = screen.getByLabelText(/Model \/ Provider selection/i)
    await user.selectOptions(modelSelect, 'modelB')

    await waitFor(() => {
      expect(total).toHaveTextContent('$291.92')
    })
  })

  it('updates total when egress mode switches to derivedFromTokens', async () => {
    render(<App />)
    const user = userEvent.setup()
    const total = screen.getByTestId('total-monthly-cost')

    const egressModeSelect = screen.getByLabelText(/Egress mode/i)
    await user.selectOptions(egressModeSelect, 'derivedFromTokens')

    await waitFor(() => {
      expect(total).toHaveTextContent('$328.18')
    })
  })

  it('handles zero requests when U_users is set to 0', async () => {
    render(<App />)
    const user = userEvent.setup()
    const total = screen.getByTestId('total-monthly-cost')

    const usersInput = screen.getByLabelText(/Number of users/i)
    await user.clear(usersInput)
    await user.type(usersInput, '0')

    const egressInput = screen.getByLabelText(/Outbound traffic/i)
    await user.clear(egressInput)
    await user.type(egressInput, '0')

    await waitFor(() => {
      expect(total).toHaveTextContent('$2.00')
    })
  })
})

