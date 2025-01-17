import { Box, Checkbox, FormControl, FormControlLabel } from '@mui/material'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import React, { useContext, useState } from 'react'

import { ApiContext } from '../../components/apiContext'
import { useMode } from '../../theme'

const SUPPORTED_LANGUAGES_DICT = { en: 'English', zh: 'Chinese' }
// Convert dictionary of supported languages into list
const SUPPORTED_LANGUAGES = Object.keys(SUPPORTED_LANGUAGES_DICT)

const RegisterEmbeddingModel = () => {
  const ERROR_COLOR = useMode()
  const endPoint = useContext(ApiContext).endPoint
  const { setErrorMsg } = useContext(ApiContext)
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    model_name: 'custom-embedding',
    dimensions: 768,
    max_tokens: 512,
    language: ['en'],
    model_uri: '/path/to/embedding-model',
  })

  // model name must be
  // 1. Starts with an alphanumeric character (a letter or a digit).
  // 2. Followed by any number of alphanumeric characters, underscores (_), or hyphens (-).
  const errorModelName = !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(
    formData.model_name
  )

  const errorDimensions = formData.dimensions < 0
  const errorMaxTokens = formData.max_tokens < 0
  const errorLanguage =
    formData.language === undefined || formData.language.length === 0

  const handleClick = async () => {
    const errorAny =
      errorModelName || errorDimensions || errorMaxTokens || errorLanguage

    if (errorAny) {
      setErrorMsg('Please fill in valid value for all fields')
      return
    }

    try {
      const response = await fetch(
        endPoint + '/v1/model_registrations/embedding',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: JSON.stringify(formData),
            persist: true,
          }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json() // Assuming the server returns error details in JSON format
        setErrorMsg(
          `Server error: ${response.status} - ${
            errorData.detail || 'Unknown error'
          }`
        )
      } else {
        setSuccessMsg(
          'Model has been registered successfully! Navigate to launch model page to proceed.'
        )
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
      setErrorMsg(error.message || 'An unexpected error occurred.')
    }
  }

  const toggleLanguage = (lang) => {
    if (formData.language.includes(lang)) {
      setFormData({
        ...formData,
        language: formData.language.filter((l) => l !== lang),
      })
    } else {
      setFormData({
        ...formData,
        language: [...formData.language, lang],
      })
    }
  }

  return (
    <React.Fragment>
      <Box padding="20px"></Box>
      {/* Base Information */}
      <FormControl sx={styles.baseFormControl}>
        <TextField
          label="Model Name"
          error={errorModelName}
          defaultValue={formData.model_name}
          size="small"
          helperText="Alphanumeric characters with properly placed hyphens and underscores. Must not match any built-in model names."
          onChange={(event) =>
            setFormData({ ...formData, model_name: event.target.value })
          }
        />
        <Box padding="15px"></Box>

        <TextField
          error={errorDimensions}
          label="Dimensions"
          value={formData.dimensions}
          size="small"
          onChange={(event) => {
            setFormData({
              ...formData,
              dimensions: parseInt(event.target.value, 10),
            })
          }}
        />
        <Box padding="15px"></Box>

        <TextField
          error={errorMaxTokens}
          label="Max Tokens"
          value={formData.max_tokens}
          size="small"
          onChange={(event) => {
            setFormData({
              ...formData,
              max_tokens: parseInt(event.target.value, 10),
            })
          }}
        />
        <Box padding="15px"></Box>

        <TextField
          label="Model Path"
          size="small"
          value={formData.model_uri}
          onChange={(e) => {
            setFormData({
              ...formData,
              model_uri: e.target.value,
            })
          }}
          helperText="Provide the model directory path."
        />
        <Box padding="15px"></Box>

        <label
          style={{
            paddingLeft: 5,
            color: errorLanguage ? ERROR_COLOR : 'inherit',
          }}
        >
          Model Languages
        </label>
        <Box sx={styles.checkboxWrapper}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Box key={lang} sx={{ marginRight: '10px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.language.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                    name={lang}
                    sx={
                      errorLanguage
                        ? {
                            'color': ERROR_COLOR,
                            '&.Mui-checked': {
                              color: ERROR_COLOR,
                            },
                          }
                        : {}
                    }
                  />
                }
                label={SUPPORTED_LANGUAGES_DICT[lang]}
                style={{
                  paddingLeft: 10,
                  color: errorLanguage ? ERROR_COLOR : 'inherit',
                }}
              />
            </Box>
          ))}
        </Box>
        <Box padding="15px"></Box>
      </FormControl>

      <Box width={'100%'}>
        {successMsg !== '' && (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            {successMsg}
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleClick}
        >
          Register Model
        </Button>
      </Box>
    </React.Fragment>
  )
}

export default RegisterEmbeddingModel

const styles = {
  baseFormControl: {
    width: '100%',
    margin: 'normal',
    size: 'small',
  },
  checkboxWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  labelPaddingLeft: {
    paddingLeft: 5,
  },
  formControlLabelPaddingLeft: {
    paddingLeft: 10,
  },
  buttonBox: {
    width: '100%',
    margin: '20px',
  },
  error: {
    fontWeight: 'bold',
    margin: '5px 0',
    padding: '1px',
    borderRadius: '5px',
  },
}
