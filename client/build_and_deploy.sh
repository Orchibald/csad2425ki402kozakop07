#!/bin/bash

# Usage: ./build_and_deploy.sh --port=/dev/cu.usbmodem2101

# Parse arguments
for arg in "$@"
do
  case $arg in
    --port=*)
    ARDUINO_PORT="${arg#*=}"
    shift # Remove argument name from processing
    ;;
    *)
    ;;
  esac
done

if [ -z "$ARDUINO_PORT" ]; then
  echo "Error: Arduino port not specified. Use --port=<port> to specify the port."
  exit 1
fi

echo "Using Arduino port: $ARDUINO_PORT"

# Export the port as an environment variable
export ARDUINO_PORT

# Build the Electron app
echo "Building Electron app..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Compile and upload Arduino sketch
echo "Compiling and uploading Arduino sketch..."

# Define the path to the Arduino sketch
ARDUINO_SKETCH_PATH="./arduino/arduino.ino"

# Define the FQBN (Fully Qualified Board Name) for your Arduino board
# For Arduino Uno, it is "arduino:avr:uno"
BOARD_FQBN="arduino:avr:uno"

# Compile the sketch
arduino-cli compile --fqbn $BOARD_FQBN $ARDUINO_SKETCH_PATH

# Check if compilation was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to compile Arduino sketch."
  exit 1
fi

# Upload the sketch
arduino-cli upload -p $ARDUINO_PORT --fqbn $BOARD_FQBN $ARDUINO_SKETCH_PATH

# Check if upload was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to upload Arduino sketch."
  exit 1
else
  echo "Arduino sketch uploaded successfully."
fi

# Create deploy directory if it doesn't exist
mkdir -p deploy

# Move the built files to the deploy directory
echo "Moving built files to deploy directory..."
mv dist/* deploy/

echo "Build and deployment completed successfully."

read -p "Press [Enter] to close..."
