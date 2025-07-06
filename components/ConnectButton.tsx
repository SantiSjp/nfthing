export default function ConnectButton() {
    return (
        <div
            style={{
                background: '#18181b', // preto escuro
                borderRadius: '0.75rem', // mais retangular, mas ainda arredondado
                padding: '2px 6px',    // máxima compactação
                display: 'inline-block',
            }}
        >
            <appkit-button data-connect />
        </div>
    )
}