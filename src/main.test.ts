import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as core from '@actions/core'
import {validate, ValidationConfig, ValidationError} from './main'

test('runs the github action', () => {
  process.env['INPUT_VALIDATIONS'] = JSON.stringify([
    {
      value: 'Failing Branch Name',
      patterns: ['^(feature|hotfix)/[\\w-]+$'],
      errorMessage: 'Invalid branch name'
    }
  ])

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {env: process.env}
  cp.execFileSync(np, [ip], options).toString()
})

test('passes when a pull request title includes a ticket', () => {
  const input: ValidationConfig = {
    value: 'my new pull request for feature PFX-2349',
    patterns: ['PFX-\\d+'],
    errorMessage: 'Please include the ticket number in the title'
  }

  const errors = validate([input])
  expect(errors).toHaveLength(0)
})

test('fails when not including ticket in pull request title', () => {
  const input: ValidationConfig = {
    value: 'failing pr title',
    patterns: ['PFX-\\d+'],
    errorMessage: 'Please include the ticket number in the title'
  }

  const errors = validate([input])
  expect(errors).toHaveLength(1)
  expect(errors[0].value).toEqual('failing pr title')
  expect(errors[0].message).toEqual(
    'Please include the ticket number in the title'
  )
})

test('passes a proper git-flow branch name', () => {
  const input: ValidationConfig = {
    value: 'feature/test-branch',
    patterns: ['^(feature|hotfix)/[\\w-]+$'],
    errorMessage: 'Invalid branch name'
  }

  const errors = validate([input])
  expect(errors).toHaveLength(0)
})

test('fails with an invalid branch name', () => {
  const input: ValidationConfig = {
    value: 'Failing Branch Name',
    patterns: ['^(feature|hotfix)/[\\w-]+$'],
    errorMessage: 'Invalid branch name'
  }

  const errors = validate([input])
  expect(errors).toHaveLength(1)
  expect(errors[0].value).toEqual('Failing Branch Name')
  expect(errors[0].message).toEqual('Invalid branch name')
})
