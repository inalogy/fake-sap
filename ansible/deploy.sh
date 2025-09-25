#!/bin/bash

# SAP HCM Application Deployment Script for Rocky Linux
# This script uses Ansible to deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check if ansible is installed
    if ! command -v ansible-playbook &> /dev/null; then
        print_error "Ansible is not installed. Please install it first:"
        echo "  pip3 install ansible"
        exit 1
    fi

    # Check if inventory file exists and has hosts
    if [[ ! -f "inventory.ini" ]]; then
        print_error "inventory.ini not found. Please create it with your server details."
        exit 1
    fi

    # Check if there are hosts in inventory
    if ! grep -q "ansible_host" inventory.ini; then
        print_warning "No hosts found in inventory.ini. Please add your Rocky Linux servers."
        echo "Example:"
        echo "  rocky-server ansible_host=192.168.1.100 ansible_user=root"
    fi

    print_status "Prerequisites check completed"
}

# Test connectivity
test_connectivity() {
    print_header "Testing Connectivity"

    print_status "Testing SSH connectivity to all hosts..."
    if ansible all -m ping; then
        print_status "All hosts are reachable"
    else
        print_error "Some hosts are not reachable. Please check your inventory and SSH configuration."
        exit 1
    fi
}

# Run deployment
deploy() {
    print_header "Deploying SAP HCM Application"

    print_status "Starting deployment..."

    # Run the playbook
    ansible-playbook playbook.yml -v

    if [[ $? -eq 0 ]]; then
        print_status "Deployment completed successfully!"
        print_status "Application should be available at http://your-server-ip"

        echo ""
        print_header "Post-Deployment Information"
        echo -e "Application Directory: ${GREEN}/opt/sap-hcm-app${NC}"
        echo -e "Database: ${GREEN}PostgreSQL${NC} (localhost:5432)"
        echo -e "Application User: ${GREEN}sap-app${NC}"
        echo -e "Process Manager: ${GREEN}PM2${NC}"
        echo -e "Web Server: ${GREEN}Nginx${NC} (port 80)"
        echo -e "API Server: ${GREEN}Node.js${NC} (port 3001, proxied via Nginx)"

        echo ""
        echo "Useful commands on the server:"
        echo "  sudo -u sap-app pm2 status          # Check application status"
        echo "  sudo -u sap-app pm2 logs            # View application logs"
        echo "  sudo -u sap-app pm2 restart all     # Restart application"
        echo "  sudo systemctl status nginx         # Check Nginx status"
        echo "  sudo systemctl status postgresql    # Check PostgreSQL status"

    else
        print_error "Deployment failed. Please check the output above for errors."
        exit 1
    fi
}

# Main execution
main() {
    print_header "SAP HCM Application Deployment"

    # Change to ansible directory
    cd "$(dirname "$0")"

    # Parse command line arguments
    case "${1:-deploy}" in
        "check")
            check_prerequisites
            ;;
        "test")
            check_prerequisites
            test_connectivity
            ;;
        "deploy")
            check_prerequisites
            test_connectivity
            deploy
            ;;
        "force-deploy")
            check_prerequisites
            deploy
            ;;
        *)
            echo "Usage: $0 [check|test|deploy|force-deploy]"
            echo ""
            echo "Commands:"
            echo "  check        - Check prerequisites only"
            echo "  test         - Check prerequisites and test connectivity"
            echo "  deploy       - Full deployment (default)"
            echo "  force-deploy - Deploy without connectivity test"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"